from pydantic import BaseModel, EmailStr, field_validator, model_validator
from datetime import datetime
from typing import Optional, Any

class UserBase(BaseModel):
    """Base schema — uses DB column names (name, not full_name)."""
    email: EmailStr
    name: Optional[str] = None                # DB column is 'name'
    bio: Optional[str] = None
    location: Optional[str] = None
    job_title: Optional[str] = None
    skills: Optional[str] = None
    experience_years: Optional[int] = 0
    is_premium: Optional[bool] = False
    trial_used: bool | None = False
    trial_remaining: int | None = 5
    profile_picture: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class UserCreate(BaseModel):
    """Registration — accepts full_name from frontend."""
    email: EmailStr
    name: Optional[str] = None
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    job_title: Optional[str] = None
    skills: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    phone: Optional[str] = None
    experience_years: Optional[int] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
