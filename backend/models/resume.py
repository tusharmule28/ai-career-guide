from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from pgvector.sqlalchemy import Vector
from sqlalchemy.sql import func
from db.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True, nullable=False)
    file_url = Column(String, nullable=False)
    extracted_text = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    extracted_data = Column(JSON, nullable=True) # AI Parsed skills, title, etc.
    
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    embedding = Column(Vector(384), nullable=True) # AI Vector representation
