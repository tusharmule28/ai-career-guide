from typing import List, Optional
from huggingface_hub import InferenceClient
from core.config import settings
from core.utils import retry_with_backoff

@retry_with_backoff(retries=3)
async def get_match_explanation(resume_text: str, job_description: str) -> str:
    """Generate a concise explanation of why the resume matches the job."""
    if not settings.HUGGING_FACE_API_TOKEN:
        return "Match explanation unavailable (API token missing)."

    client = InferenceClient(api_key=settings.HUGGING_FACE_API_TOKEN)
    
    prompt = f"""
    Explain concisely why this resume is a good match for this job description.
    Focus on key overlapping skills and experience.
    Resume: {resume_text[:2000]}
    Job Description: {job_description[:2000]}
    Match Explanation:
    """
    
    try:
        response = client.text_generation(
            prompt,
            model="mistralai/Mistral-7B-Instruct-v0.2",
            max_new_tokens=300,
            temperature=0.5
        )
        return response.strip()
    except Exception as e:
        print(f"Error calling HF API for match explanation: {e}")
        return "An error occurred while generating the match explanation."

@retry_with_backoff(retries=3)
async def get_improvement_suggestions(missing_skills: Optional[List[str]]) -> str:
    """Provide a brief learning plan or improvement areas."""
    if not settings.HUGGING_FACE_API_TOKEN:
        return "Improvement plan unavailable (API token missing)."
    
    if not missing_skills:
        return "You have all the key skills! Focus on refining your current portfolio."

    client = InferenceClient(api_key=settings.HUGGING_FACE_API_TOKEN)
    
    prompt = f"""
    Based on these missing skills for a job, create a very brief 3-step learning plan or improvement focus areas.
    Missing Skills: {', '.join(missing_skills)}
    Improvement Plan:
    """
    
    try:
        response = client.text_generation(
            prompt,
            model="mistralai/Mistral-7B-Instruct-v0.2",
            max_new_tokens=300,
            temperature=0.5
        )
        return response.strip()
    except Exception as e:
        print(f"Error calling HF API for improvement plan: {e}")
        return "An error occurred while generating the improvement plan."
