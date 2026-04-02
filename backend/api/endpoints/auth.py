from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from core.config import settings
from core.security import create_access_token
from db.database import get_db
from schemas.user import UserCreate, UserResponse, Token
from services.user_service import UserService

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user_service = UserService(db)
    user = user_service.get_user_by_email(user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    return user_service.create_user(user_in)

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    user_service = UserService(db)
    user = user_service.authenticate_user(
        email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    return {
        "access_token": create_access_token(
            user.email, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
