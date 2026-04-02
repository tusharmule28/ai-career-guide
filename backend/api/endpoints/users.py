from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from schemas.user import UserResponse, UserCreate
from services.user_service import UserService

router = APIRouter()

def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)

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
