from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from ultralytics import YOLO
import uuid
import os
import shutil
import random
import datetime
import math

import models
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Indore Pothole Tracker API - Production")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

try:
    model = YOLO('yolov8n.pt')
except Exception as e:
    model = None

# --- WebSocket Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- Geospatial Logic ---
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000 # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

# --- API Endpoints ---
@app.post("/api/report")
async def create_report(
    context_note: str = Form(""),
    latitude: float = Form(...),
    longitude: float = Form(...),
    ward: str = Form("Ward 32"),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Save Image
    file_ext = image.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{file_ext}"
    filepath = os.path.join("uploads", filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    
    # Advanced YOLO Mock
    visual_severity = random.randint(3, 10)
    confidence = round(random.uniform(70.0, 98.5), 1)
    issue_type = random.choice(["Pothole", "Streetlight", "Road Damage", "Drain"])
    description = f"{issue_type} detected - Severity {visual_severity}/10"
    
    # Context Weight Analysis
    context_weight = 1.0
    context_note_lower = context_note.lower()
    context_reason = "Residential lane"
    if "school" in context_note_lower or "hospital" in context_note_lower:
        context_weight = 2.5
        context_reason = "School/Hospital zone"
    elif "main" in context_note_lower or "highway" in context_note_lower:
        context_weight = 2.0
        context_reason = "Main road"
    elif "busy" in context_note_lower:
        context_weight = 1.5
        context_reason = "Busy area"
        
    # Duplicate Detection (100m radius)
    existing_reports = db.query(models.Report).filter(models.Report.status != "Resolved").all()
    duplicates = []
    for r in existing_reports:
        dist = haversine(latitude, longitude, r.location_lat, r.location_lon)
        if dist < 100 and r.issue_type == issue_type:
            duplicates.append(r)
            
    duplicate_weight = 1 + len(duplicates)
    
    # Priority Calculation
    priority_score = int(visual_severity * duplicate_weight * context_weight)
    
    priority_reasoning = f"{visual_severity}/10 damage × {duplicate_weight}x duplicate weight × {context_reason}"
    
    db_report = models.Report(
        report_id=f"IP-{str(uuid.uuid4())[:6].upper()}",
        issue_type=issue_type,
        photo_path=f"/uploads/{filename}",
        location_lat=latitude,
        location_lon=longitude,
        description=description,
        visual_severity=visual_severity,
        duplicate_weight=duplicate_weight,
        context_weight=context_weight,
        priority_score=priority_score,
        priority_reasoning=priority_reasoning,
        ward=ward,
        confidence=confidence,
        status="Reported"
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    # Link duplicates
    for d in duplicates:
        # Also increment the duplicate weight of existing reports in this cluster for accurate ranking
        d.duplicate_weight += 1
        d.priority_score = int(d.visual_severity * d.duplicate_weight * d.context_weight)
        
        dup_link = models.Duplicate(
            main_report_id=d.id, # Link new to old
            duplicate_report_id=db_report.id,
            similarity_score=85.0
        )
        db.add(dup_link)
    db.commit()

    await manager.broadcast({"event": "NEW_REPORT", "data": db_report.report_id})
    return db_report

@app.get("/api/reports")
def get_reports(db: Session = Depends(get_db)):
    reports = db.query(models.Report).order_by(models.Report.priority_score.desc()).all()
    return reports

@app.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    total = db.query(models.Report).count()
    pending = db.query(models.Report).filter(models.Report.status == "Reported").count()
    in_progress = db.query(models.Report).filter(models.Report.status.in_(["Acknowledged", "In Progress"])).count()
    resolved = db.query(models.Report).filter(models.Report.status == "Resolved").count()
    
    return {
        "total": total,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved,
        "percent_resolved": round((resolved / total * 100) if total > 0 else 0, 1)
    }

@app.post("/api/report/{id}/status")
async def update_status(id: int, status: str = Form(...), notes: str = Form(""), db: Session = Depends(get_db)):
    report = db.query(models.Report).filter(models.Report.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    old_status = report.status
    report.status = status
    report.updated_at = datetime.datetime.utcnow()
    
    history = models.StatusHistory(
        report_id=report.id,
        old_status=old_status,
        new_status=status,
        notes=notes
    )
    db.add(history)
    db.commit()
    db.refresh(report)
    
    await manager.broadcast({"event": "STATUS_UPDATE", "report_id": report.report_id, "new_status": status})
    return report

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
