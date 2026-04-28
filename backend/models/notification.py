from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from db.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    
    # Notification Type/Category for filtering: "jobs", "applications", "suggestions", "system"
    category = Column(String, default="system", index=True)
    
    # Priority level: "high", "medium", "low"
    priority = Column(String, default="medium", index=True)
    
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    link = Column(String, nullable=True) # e.g. "/jobs?id=123"
    
    # JSON field for additional dynamic data (job_id, app_id, match_score, etc.)
    metadata = Column(JSON, nullable=True)
    
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Notification(user_id={self.user_id}, category={self.category}, title={self.title}, is_read={self.is_read})>"
