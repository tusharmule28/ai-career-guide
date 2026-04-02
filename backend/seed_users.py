import sys
import os

# Add backend to path
sys.path.append(os.getcwd())

from db.database import SessionLocal
from services.user_service import UserService
from schemas.user import UserCreate
from models.user import User

def seed_admin_user():
    db = SessionLocal()
    user_service = UserService(db)
    
    admin_email = "admin@example.com"
    admin_password = "admin123"
    
    print(f"Checking if admin user {admin_email} exists...")
    
    existing_user = user_service.get_user_by_email(admin_email)
    if existing_user:
        print(f"User {admin_email} already exists. Skipping.")
        return
    
    print(f"Creating admin user {admin_email}...")
    user_in = UserCreate(
        email=admin_email,
        password=admin_password,
        name="System Admin"
    )
    
    try:
        user_service.create_user(user_in)
        print(f"Successfully created admin user: {admin_email}")
        print(f"Password: {admin_password}")
        print("IMPORTANT: Store these credentials safely.")
    except Exception as e:
        print(f"Error creating user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin_user()
