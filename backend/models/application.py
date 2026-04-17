from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
import enum
from sqlalchemy.sql import func
from db.database import Base

class ApplicationStatus(enum.Enum):
    PENDING = "Pending"
    APPLIED = "Applied"
    SCREENED = "Screened"
    INTERVIEW = "Interviewing"
    OFFERED = "Offered"
    REJECTED = "Rejected"
    DEMO = "Demo"

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), index=True, nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String, nullable=True)
