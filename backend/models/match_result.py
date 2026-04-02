from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from db.database import Base

class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    score = Column(Float, nullable=False) # Similarity score (0-100)
    matched_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<MatchResult(user_id={self.user_id}, job_id={self.job_id}, score={self.score})>"
