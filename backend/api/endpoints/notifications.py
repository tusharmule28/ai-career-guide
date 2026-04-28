from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import asyncio
import json
from db.database import get_db
from core.security import get_current_user
from models.user import User
from models.notification import Notification
from core.notifications import notifier

router = APIRouter()

@router.get("/", response_model=Dict[str, Any])
async def get_my_notifications(
    category: Optional[str] = Query(None, description="Filter by category: jobs, applications, suggestions, system"),
    unread_only: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get notifications for the current user with filtering and pagination.
    """
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if category:
        query = query.filter(Notification.category == category)
    if unread_only:
        query = query.filter(Notification.is_read == False)
        
    total = query.count()
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
    results = []
    for n in notifications:
        results.append({
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "link": n.link,
            "category": n.category,
            "priority": n.priority,
            "metadata": n.metadata,
            "is_read": n.is_read,
            "created_at": n.created_at
        })
    
    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    return {
        "notifications": results,
        "total": total,
        "unread_count": unread_count
    }

@router.get("/stream")
async def stream_notifications(
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    # Optional dependency since we might use the query token
    current_user_from_header: Optional[User] = Depends(lambda: None) 
):
    """
    SSE endpoint for real-time notification updates.
    Supports token in query parameter for EventSource compatibility.
    """
    from core.security import get_current_user_from_token
    
    # Try to get user from header first, then from query token
    user = None
    try:
        # This is a bit of a hack to reuse existing logic
        # Ideally, create a custom dependency that checks both
        user = await get_current_user(db, current_user_from_header) if current_user_from_header else None
    except:
        pass

    if not user and token:
        try:
            user = get_current_user_from_token(db, token)
        except:
            raise HTTPException(status_code=401, detail="Invalid token")
            
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    async def event_generator():
        queue = notifier.subscribe(user.id)
        try:
            while True:
                # Wait for a new notification
                data = await queue.get()
                yield f"data: {json.dumps(data)}\n\n"
        except asyncio.CancelledError:
            notifier.unsubscribe(user.id, queue)
            raise

    return StreamingResponse(event_generator(), media_type="text/event-stream")

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
