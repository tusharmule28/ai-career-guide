from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from core.config import settings
from db.database import get_db
from models.user import User
from services.user_service import UserService
from schemas.user import TokenData

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.VERSION}/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenData(email=payload.get("sub"))
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user_service = UserService(db)
    user = user_service.get_user_by_email(email=token_data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
