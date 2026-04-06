import logging
from sqlalchemy.orm import Session
from models.user import User
from models.resume import Resume
from models.job import Job
from models.notification import Notification
from services.matching_service import matching_service
from typing import List

logger = logging.getLogger(__name__)

class NotificationService:
    async def notify_matching_users(self, db: Session, new_jobs: List[Job]):
        """
        Process new jobs, find matching users with uploaded resumes,
        and generate in-app notifications for high-score matches.
        """
        if not new_jobs:
            return

        logger.info(f"Processing notifications for {len(new_jobs)} new jobs...")

        # 1. Get all users who have a resume with an embedding
        # We limit to users with resumes to ensure we have something to match against
        users_with_resumes = (
            db.query(User, Resume)
            .join(Resume, User.id == Resume.user_id)
            .filter(Resume.embedding != None)
            .all()
        )

        for user, resume in users_with_resumes:
            for job in new_jobs:
                if not job.embedding:
                    continue

                # 2. Calculate match score using the existing matching service logic
                try:
                    # We can use a simplified version of find_matches here 
                    # since we only care about this one job
                    distance_query = db.query(Job.embedding.cosine_distance(resume.embedding)).filter(Job.id == job.id).scalar()
                    
                    if distance_query is not None:
                        dist = float(distance_query)
                        # Use the same scoring logic as matching_service.py
                        match_score = max(0, (1.2 - dist) * 83.3)
                        
                        # 3. If score > 80%, create a notification
                        if match_score >= 80:
                            # Check if notification already exists for this job/user to avoid spam
                            existing = db.query(Notification).filter(
                                Notification.user_id == user.id,
                                Notification.link == f"/jobs?id={job.id}"
                            ).first()

                            if not existing:
                                notification = Notification(
                                    user_id=user.id,
                                    title="New High-Match Job Found! 🚀",
                                    message=f"We found a {round(match_score)}% match for you: '{job.title}' at {job.company}.",
                                    link=f"/jobs?id={job.id}",
                                    type="match"
                                )
                                db.add(notification)
                                logger.info(f"Created notification for user {user.id} and job {job.id}")

                except Exception as e:
                    logger.error(f"Error processing notification for user {user.id} and job {job.id}: {e}")
                    continue
        
        db.commit()

notification_service = NotificationService()
