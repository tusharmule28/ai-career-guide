from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from db.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    type = Column(String, default="match") # "match", "system", etc.
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    link = Column(String, nullable=True) # e.g. "/jobs?id=123"
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Notification(user_id={self.user_id}, title={self.title}, is_read={self.is_read})>"
