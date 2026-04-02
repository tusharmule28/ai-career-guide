from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from pgvector.sqlalchemy import Vector
from sqlalchemy.sql import func
from db.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    company = Column(String, index=True, nullable=False)
    location = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, nullable=False) # List of skills
    posted_at = Column(DateTime(timezone=True), server_default=func.now())
    embedding = Column(Vector(384), nullable=True) # AI Vector representation
    apply_url = Column(String, nullable=False) # Direct application link
    source = Column(String, nullable=True) # E.g., 'Remotive', 'WWR'
    external_id = Column(String, unique=True, index=True, nullable=True) # Deduplication ID

    def __repr__(self):
        return f"<Job(title={self.title}, company={self.company}>"
