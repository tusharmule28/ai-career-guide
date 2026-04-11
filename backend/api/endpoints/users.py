from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from schemas.user import UserResponse, UserCreate, ProfileUpdate
from services.user_service import UserService
from models.user import User
from core.security import get_current_user

router = APIRouter()

def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)

@router.get("/profile", response_model=dict)
async def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Handle social links JSON
    import json
    socials = {}
    if user.social_links:
        try:
            socials = json.loads(user.social_links)
        except Exception:
            pass
            
    return {
        "full_name": user.name,
        "email": user.email,
        "bio": user.bio,
        "location": user.location,
        "job_title": user.job_title,
        "skills": user.skills,
        "experience_years": user.experience_years,
        "github": socials.get("github", ""),
        "linkedin": socials.get("linkedin", ""),
        "portfolio": socials.get("portfolio", ""),
        "phone": socials.get("phone", ""),
        "is_premium": user.is_premium,
        "profile_picture": user.profile_picture
    }

@router.post("/profile/update", response_model=UserResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields - Note: DB column is 'name', frontend/schema uses 'full_name'
    if profile_data.full_name is not None:
        user.name = profile_data.full_name
    if profile_data.bio is not None:
        user.bio = profile_data.bio
    if profile_data.location is not None:
        user.location = profile_data.location
    if profile_data.job_title is not None:
        user.job_title = profile_data.job_title
    if profile_data.experience_years is not None:
        user.experience_years = profile_data.experience_years
    
    # Handle social links as JSON
    import json
    socials = {}
    if user.social_links:
        try:
            socials = json.loads(user.social_links)
        except Exception:
            pass
            
    if profile_data.github is not None:
        socials["github"] = profile_data.github
    if profile_data.linkedin is not None:
        socials["linkedin"] = profile_data.linkedin
    if profile_data.portfolio is not None:
        socials["portfolio"] = profile_data.portfolio
    if profile_data.phone is not None:
        socials["phone"] = profile_data.phone
        
    user.social_links = json.dumps(socials)
    
    db.commit()
    db.refresh(user)
    
    # Map for response
    user.github = socials.get("github", "")
    user.linkedin = socials.get("linkedin", "")
    
    return user

@router.get("/", response_model=List[UserResponse])
def get_users(
    skip: int = 0, 
    limit: int = 100, 
    user_service: UserService = Depends(get_user_service)
):
    """
    Retrieve all users.
    """
    return user_service.get_users(skip=skip, limit=limit)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user: UserCreate, 
    user_service: UserService = Depends(get_user_service)
):
    """
    Create a new user.
    """
    db_user = user_service.get_user_by_email(email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return user_service.create_user(user=user)
