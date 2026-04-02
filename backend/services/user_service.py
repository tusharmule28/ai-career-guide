from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate
from core.security import get_password_hash, verify_password

class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_users(self, skip: int = 0, limit: int = 100):
        return self.db.query(User).offset(skip).limit(limit).all()
        
    def create_user(self, user: UserCreate) -> User:
        db_user = User(
            email=user.email,
            name=user.name,
            hashed_password=get_password_hash(user.password)
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def authenticate_user(self, email: str, password: str) -> User | None:
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
