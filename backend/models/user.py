from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    fcm_token = Column(String, nullable=True) # FCM Device Token
    
    # Resume Reference
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)
    
    # Profile Enhancements
    bio = Column(String, nullable=True)
    job_title = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)
    social_links = Column(String, nullable=True) # Stored as JSON string for flexibility
    location = Column(String, nullable=True)
    skills = Column(String, nullable=True) # Manually overrideable skills
    experience_years = Column(Integer, default=0)
    
    # Premium & Trial Fields
    is_premium = Column(Boolean, default=False)
    premium_until = Column(DateTime, nullable=True)
    razorpay_customer_id = Column(String, nullable=True)
    ai_credits = Column(Integer, default=3)  # Free tier: 3 Apply-with-AI uses
    trial_used = Column(Boolean, default=False)
    trial_remaining = Column(Integer, default=5)
    
    hashed_password = Column(String, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
