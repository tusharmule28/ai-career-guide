import resend
import logging
from core.config import settings
from typing import List, Optional

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        if settings.RESEND_API_KEY:
            resend.api_key = settings.RESEND_API_KEY
            self.enabled = True
        else:
            self.enabled = False
            logger.warning("RESEND_API_KEY not found. Email notifications will be disabled.")

    async def send_match_notification(self, to_email: str, user_name: str, job_title: str, company: str, match_score: float, job_url: str):
        if not self.enabled:
            return False

        try:
            params = {
                "from": settings.RESEND_FROM_EMAIL,
                "to": [to_email],
                "subject": f"New 80%+ Match Found: {job_title} at {company} 🚀",
                "html": f"""
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
                    <h2 style="color: #6366F1;">Hello {user_name}!</h2>
                    <p style="font-size: 16px; line-height: 1.5; color: #475569;">
                        Our AI matching engine just flagged a high-potency role that matches your profile with <strong>{round(match_score)}% synergy</strong>.
                    </p>
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1e293b;">{job_title}</h3>
                        <p style="margin-bottom: 0; color: #64748b;">at <strong>{company}</strong></p>
                    </div>
                    <p style="margin-bottom: 30px;">
                        <a href="{job_url}" style="background-color: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            View Details & Apply
                        </a>
                    </p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                        AI Career Guide – Precision Matching for Modern Talent
                    </p>
                </div>
                """
            }
            
            # Resend's Python SDK currently doesn't have a built-in async send, 
            # so we use loop.run_in_executor in production or just call it if low volume.
            import asyncio
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, lambda: resend.Emails.send(params))
            
            logger.info(f"Successfully sent match email to {to_email} for job {job_title}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email via Resend: {e}")
            return False

email_service = EmailService()
