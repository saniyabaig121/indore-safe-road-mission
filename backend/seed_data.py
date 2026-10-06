import random
import uuid
import datetime
import math
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

models.Base.metadata.create_all(bind=engine)

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def seed_db():
    db = SessionLocal()
    db.query(models.Duplicate).delete()
    db.query(models.StatusHistory).delete()
    db.query(models.AdminNote).delete()
    db.query(models.Notification).delete()
    db.query(models.Report).delete()
    db.commit()

    issue_types = ["Pothole"] * 50 + ["Streetlight"] * 30 + ["Drain"] * 20
    wards = [f"Ward {i}" for i in [32, 42, 12, 7, 15, 8, 22, 55, 1, 85]]
    statuses = ["Reported"] * 40 + ["In Progress"] * 35 + ["Resolved"] * 25
    contexts = [
        ("Near school zone", 2.5), 
        ("Main road, very busy", 2.0),
        ("Busy intersection", 1.5),
        ("Residential lane", 1.0),
        ("Hospital entrance", 2.5)
    ]
    
    base_lat = 22.7196
    base_lon = 75.8577
    
    created_reports = []

    for _ in range(100):
        lat = base_lat + random.uniform(-0.1, 0.1)
        lon = base_lon + random.uniform(-0.1, 0.1)
        
        # Simulate clustering (40% chance to be near an existing report)
        if created_reports and random.random() < 0.4:
            target = random.choice(created_reports)
            lat = target.location_lat + random.uniform(-0.0005, 0.0005) # ~50m offset
            lon = target.location_lon + random.uniform(-0.0005, 0.0005)

        issue_type = random.choice(issue_types)
        visual_severity = random.randint(3, 10)
        context_reason, context_weight = random.choice(contexts)
        
        # Calculate duplicates
        duplicates = [r for r in created_reports if haversine(lat, lon, r.location_lat, r.location_lon) < 100 and r.issue_type == issue_type]
        duplicate_weight = 1 + len(duplicates)
        
        priority_score = int(visual_severity * duplicate_weight * context_weight)
        reasoning = f"{visual_severity}/10 damage × {duplicate_weight}x duplicate weight × {context_reason}"
        
        days_ago = random.randint(0, 45)
        created_at = datetime.datetime.utcnow() - datetime.timedelta(days=days_ago)
        status = random.choice(statuses)
        
        report = models.Report(
            report_id=f"IP-{str(uuid.uuid4())[:6].upper()}",
            issue_type=issue_type,
            photo_path=f"https://via.placeholder.com/300x200?text={issue_type}+{random.randint(1,100)}",
            location_lat=lat,
            location_lon=lon,
            description=f"{issue_type} detected with high confidence.",
            visual_severity=visual_severity,
            priority_score=priority_score,
            priority_reasoning=reasoning,
            duplicate_weight=duplicate_weight,
            context_weight=context_weight,
            status=status,
            confidence=round(random.uniform(70.0, 99.0), 1),
            ward=random.choice(wards),
            created_at=created_at,
            updated_at=created_at + datetime.timedelta(days=random.randint(0, 5))
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        created_reports.append(report)
        
        # Add history if not Reported
        if status != "Reported":
            hist = models.StatusHistory(
                report_id=report.id,
                old_status="Reported",
                new_status=status,
                changed_at=report.updated_at,
                notes="Inspected by municipal team."
            )
            db.add(hist)
            db.commit()
            
            if status == "Resolved":
                note = models.AdminNote(
                    report_id=report.id,
                    note_text="Filled with cold mix asphalt.",
                    cost_estimate=visual_severity * 500,
                    created_at=report.updated_at
                )
                db.add(note)
                db.commit()

        # Link duplicates
        for d in duplicates:
            dup_link = models.Duplicate(
                main_report_id=d.id,
                duplicate_report_id=report.id,
                similarity_score=85.0
            )
            db.add(dup_link)
            
            # Update existing report weights
            d.duplicate_weight += 1
            d.priority_score = int(d.visual_severity * d.duplicate_weight * d.context_weight)
            d.priority_reasoning = f"{d.visual_severity}/10 damage × {d.duplicate_weight}x duplicate weight × {context_reason}"
        db.commit()

    print("100 realistic clustered reports seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_db()
