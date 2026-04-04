from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    
    # Profile Enhancements
    bio = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)
    social_links = Column(String, nullable=True) # Stored as JSON string for flexibility
    location = Column(String, nullable=True)
    job_title = Column(String, nullable=True)
    skills = Column(String, nullable=True) # Manually overrideable skills
    
    hashed_password = Column(String, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
