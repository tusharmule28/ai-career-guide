import json
import logging
from typing import Dict, Any, List
from groq import AsyncGroq
from core.config import settings

logger = logging.getLogger(__name__)

class ProfileService:
    def __init__(self):
        self.client = None
        if settings.GROQ_API_KEY:
            self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    async def extract_profile_from_text(self, text: str) -> Dict[str, Any]:
        """
        Extract structured profile data from resume text using Groq.
        """
        if not self.client:
            logger.warning("Groq API key not set. Skipping profile extraction.")
            return {}

        prompt = f"""
        Extract the following information from this resume text.
        Return ONLY valid JSON in this exact format:
        {{
            "job_title": "string or null",
            "skills": ["skill1", "skill2"],
            "experience_years": integer or 0,
            "summary": "brief professional summary (max 2 sentences)"
        }}

        Resume Text:
        {text[:4000]}
        """

        try:
            completion = await self.client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0,
                response_format={"type": "json_object"}
            )
            
            data = json.loads(completion.choices[0].message.content)
            # Ensure skills is a list
            if isinstance(data.get("skills"), str):
                data["skills"] = [s.strip() for s in data["skills"].split(",")]
            
            return data
        except Exception as e:
            logger.error(f"Error extracting profile with Groq: {e}")
            return {}

profile_service = ProfileService()
