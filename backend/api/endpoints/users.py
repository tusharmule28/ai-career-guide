from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from schemas.user import UserResponse, UserCreate
from services.user_service import UserService
from models.user import User
from core.security import get_current_user

router = APIRouter()

def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)

@router.post("/profile/update", response_model=dict)
async def update_profile(
    profile_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    user.full_name = profile_data.get("full_name", user.full_name)
    user.bio = profile_data.get("bio", user.bio)
    user.location = profile_data.get("location", user.location)
    user.job_title = profile_data.get("job_title", user.job_title)
    user.skills = profile_data.get("skills", user.skills)
    
    # Handle social links as JSON
    import json
    socials = {
        "github": profile_data.get("github"),
        "linkedin": profile_data.get("linkedin")
    }
    user.social_links = json.dumps(socials)
    
    db.commit()
    return {"message": "Profile updated successfully"}

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
