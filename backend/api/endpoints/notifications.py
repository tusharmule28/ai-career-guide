from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from db.database import get_db
from core.security import get_current_user
from models.user import User
from models.notification import Notification

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
async def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all notifications for the current user, ordered by most recent.
    """
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )
    
    results = []
    for n in notifications:
        results.append({
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "link": n.link,
            "is_read": n.is_read,
            "type": n.type,
            "created_at": n.created_at
        })
    
    return results

@router.patch("/{id}/read", response_model=Dict[str, Any])
async def mark_notification_as_read(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark a specific notification as read.
    """
    notification = db.query(Notification).filter(Notification.id == id, Notification.user_id == current_user.id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read", "is_read": True}

@router.patch("/read-all", response_model=Dict[str, Any])
async def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark all unread notifications for the current user as read.
    """
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    return {"message": "All notifications marked as read"}
