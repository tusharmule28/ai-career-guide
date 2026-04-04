from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from db.database import Base

class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), index=True, nullable=False)
    saved_at = Column(DateTime(timezone=True), server_default=func.now())
