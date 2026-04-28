from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from models.notification import Notification
from models.user import User
from core.notifications import notifier
import asyncio

class NotificationService:
    async def create_notification(
        self,
        db: Session,
        user_id: int,
        title: str,
        message: str,
        category: str = "system",
        priority: str = "medium",
        link: Optional[str] = None,
        meta_data: Optional[Dict[str, Any]] = None
    ) -> Notification:
        """
        Create a new notification for a user and trigger real-time update.
        """
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            category=category,
            priority=priority,
            link=link,
            meta_data=meta_data
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        # Trigger real-time update via SSE
        await notifier.notify(user_id, {
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "link": notification.link,
            "category": notification.category,
            "priority": notification.priority,
            "metadata": notification.meta_data,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat() if notification.created_at else None
        })
        
        return notification

    async def notify_job_match(
        self,
        db: Session,
        user_id: int,
        job_id: int,
        job_title: str,
        company: str,
        match_score: float
    ):
        """
        Notify user of a high-priority job match.
        """
        title = "New High-Quality Match!"
        message = f"We found a {match_score}% match for you: {job_title} at {company}."
        link = f"/jobs?id={job_id}"
        
        return await self.create_notification(
            db=db,
            user_id=user_id,
            title=title,
            message=message,
            category="jobs",
            priority="high" if match_score >= 85 else "medium",
            link=link,
            meta_data={"job_id": job_id, "match_score": match_score}
        )

    async def notify_application_status(
        self,
        db: Session,
        user_id: int,
        application_id: int,
        job_title: str,
        status: str
    ):
        """
        Notify user of an application status update.
        """
        title = "Application Update"
        message = f"Your application for {job_title} is now: {status}."
        link = f"/applications/{application_id}"
        
        return await self.create_notification(
            db=db,
            user_id=user_id,
            title=title,
            message=message,
            category="applications",
            priority="high",
            link=link,
            meta_data={"application_id": application_id, "status": status}
        )

    async def notify_system_alert(
        self,
        db: Session,
        user_id: int,
        title: str,
        message: str,
        priority: str = "medium"
    ):
        """
        Send a system-level alert.
        """
        return await self.create_notification(
            db=db,
            user_id=user_id,
            title=title,
            message=message,
            category="system",
            priority=priority
        )

    async def notify_matching_users(self, db: Session, new_jobs: list):
        """
        Check all active users for matches against new jobs and notify them.
        """
        from models.resume import Resume
        from services.matching_service import matching_service
        
        # Get all users with resumes
        users_with_resumes = db.query(User).join(Resume).all()
        
        for user in users_with_resumes:
            resume = db.query(Resume).filter(Resume.user_id == user.id).first()
            if not resume or not resume.extracted_text:
                continue
                
            for job in new_jobs:
                # Calculate match score
                match_data = await matching_service.calculate_score(resume.extracted_text, job, user)
                if match_data.get("score", 0) >= 80: # Threshold for notification
                    await self.notify_job_match(
                        db=db,
                        user_id=user.id,
                        job_id=job.id,
                        job_title=job.title,
                        company=job.company,
                        match_score=match_data["score"]
                    )

notification_service = NotificationService()
