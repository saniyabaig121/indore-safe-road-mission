from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String, unique=True, index=True)
    photo_path = Column(String)
    location_lat = Column(Float)
    location_lon = Column(Float)
    issue_type = Column(String)
    description = Column(String)
    visual_severity = Column(Integer) # 1-10
    priority_score = Column(Integer)
    priority_reasoning = Column(String)
    duplicate_weight = Column(Integer, default=1)
    context_weight = Column(Float, default=1.0)
    status = Column(String, default="Reported") # Reported, Acknowledged, In Progress, Resolved
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    reporter_id = Column(String, nullable=True)
    confidence = Column(Float, default=0.0)
    ward = Column(String)
    
    duplicates = relationship("Duplicate", foreign_keys="[Duplicate.main_report_id]", back_populates="main_report")
    history = relationship("StatusHistory", back_populates="report")
    notes = relationship("AdminNote", back_populates="report", uselist=False)

class Duplicate(Base):
    __tablename__ = "duplicates"
    id = Column(Integer, primary_key=True, index=True)
    main_report_id = Column(Integer, ForeignKey("reports.id"))
    duplicate_report_id = Column(Integer, ForeignKey("reports.id"))
    similarity_score = Column(Float)
    linked_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    main_report = relationship("Report", foreign_keys=[main_report_id], back_populates="duplicates")

class StatusHistory(Base):
    __tablename__ = "status_history"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    old_status = Column(String)
    new_status = Column(String)
    changed_at = Column(DateTime, default=datetime.datetime.utcnow)
    changed_by = Column(String, default="System")
    notes = Column(String, nullable=True)
    
    report = relationship("Report", back_populates="history")

class AdminNote(Base):
    __tablename__ = "admin_notes"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), unique=True)
    note_text = Column(String)
    photo_before = Column(String, nullable=True)
    photo_after = Column(String, nullable=True)
    cost_estimate = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    report = relationship("Report", back_populates="notes")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String)
    report_id = Column(Integer, ForeignKey("reports.id"))
    message = Column(String)
    read_status = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
