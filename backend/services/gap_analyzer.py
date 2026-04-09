import logging
import json
from groq import AsyncGroq
from core.config import settings

logger = logging.getLogger(__name__)

class GapAnalyzerService:
    def __init__(self):
        self.client = None
        if settings.GROQ_API_KEY:
            self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    async def analyze_resume_gap(self, resume_text: str, profile_text: str = ""):
        """
        Analyzes the resume/profile against general market standards for the user's role
        and suggests concrete improvements.
        """
        if not self.client:
            return {"error": "AI service not configured."}

        prompt = f"""
        You are an expert technical career coach. Analyze the following resume/profile content.
        Identify:
        1. Critical missing keywords/technologies for modern tech roles.
        2. Suggestions for improving bullet points (more impact-oriented).
        3. Resume structure gaps.
        4. A 'Market Readiness' score out of 100.

        Return ONLY valid JSON in this format:
        {{
            "readiness_score": 85,
            "missing_keywords": ["Kubernetes", "CI/CD"],
            "improvement_suggestions": ["Rewrite the bullet point about API scaling to include specific metrics like -Reduced latency by 30%-"],
            "structural_feedback": "Add a dedicated Projects section to highlight your open-source contributions."
        }}

        Content:
        {profile_text}
        {resume_text[:4000]}
        """

        try:
            completion = await self.client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=500,
                response_format={"type": "json_object"}
            )
            return json.loads(completion.choices[0].message.content)
        except Exception as e:
            logger.error(f"Error in gap analysis AI: {e}")
            return {"error": "Failed to analyze gap."}

gap_analyzer = GapAnalyzerService()
