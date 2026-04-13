from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings

# Create PostgreSQL engine
engine = create_engine(
    settings.DATABASE_URL,
    # pool_pre_ping=True helps handle dropped connections 
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

# Session local factory for creating database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base class for SQLAlchemy models
Base = declarative_base()

def get_db():
    """
    Dependency function to yield a database session.
    Closes the session after the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
