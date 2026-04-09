import logging
import json
from groq import AsyncGroq
from core.config import settings
from models.user import User

logger = logging.getLogger(__name__)

class ApplicationAssistantService:
    def __init__(self):
        self.client = None
        if settings.GROQ_API_KEY:
            self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    async def generate_application_package(self, user: User, job_title: str, job_description: str, resume_text: str):
        """
        Generates a tailored cover letter and a pre-fill data object for the user.
        """
        if not self.client:
            return {"error": "AI service not configured."}

        prompt = f"""
        You are an expert HR consultant. Create a brief, impactful tailored cover letter and a pre-fill form data object 
        for this candidate applying to the following job.

        Candidate Name: {user.name}
        Job Title: {job_title}
        Job Description: {job_description[:2000]}
        Candidate Experience Summary: {user.bio}
        Resume Content: {resume_text[:2000]}

        Return ONLY valid JSON in this format:
        {{
            "cover_letter": "The full text of the tailored cover letter...",
            "pre_fill_data": {{
                "first_name": "...",
                "last_name": "...",
                "email": "...",
                "phone": "...",
                "linkedin": "...",
                "github": "...",
                "portfolio": "...",
                "summary": "A 2-sentence summary tailored for this job"
            }},
            "top_skills_to_highlight": ["Skill 1", "Skill 2"]
        }}
        """

        try:
            completion = await self.client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=1000,
                response_format={"type": "json_object"}
            )
            return json.loads(completion.choices[0].message.content)
        except Exception as e:
            logger.error(f"Error in application assistant AI: {e}")
            return {"error": "Failed to generate application package."}

application_assistant = ApplicationAssistantService()
