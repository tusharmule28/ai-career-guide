from typing import List, Optional
from huggingface_hub import AsyncInferenceClient
from core.config import settings
from core.utils import retry_with_backoff
import logging

logger = logging.getLogger(__name__)

async def call_hf_with_failover(prompt: str, max_tokens: int = 300) -> str:
    """
    Tries to generate text using a list of models. If one fails, it moves to the next.
    """
    models = [
        "HuggingFaceH4/zephyr-7b-beta",
        "mistralai/Mistral-7B-Instruct-v0.2",
        "google/gemma-7b-it"
    ]
    
    client = AsyncInferenceClient(api_key=settings.HUGGING_FACE_API_TOKEN)
    
    last_error = None
    for model_id in models:
        try:
            logger.info(f"Attempting AI generation with model: {model_id}")
            response = await client.text_generation(
                prompt,
                model=model_id,
                max_new_tokens=max_tokens,
                temperature=0.7
            )
            return response.strip()
        except Exception as e:
            last_error = e
            logger.warning(f"Model {model_id} failed: {str(e)[:100]}. Trying next fallback...")
            continue
            
    # If all models in the failover list fail, raise the last exception to trigger the global retry decorator
    raise last_error

@retry_with_backoff(retries=5)
async def get_match_explanation(resume_text: str, job_description: str) -> str:
    """Generate a concise explanation of why the resume matches the job."""
    if not settings.HUGGING_FACE_API_TOKEN:
        return "Match explanation unavailable (API token missing)."

    prompt = f"""
    Explain concisely why this resume is a good match for this job description.
    Focus on key overlapping skills and experience.
    Resume: {resume_text[:1000]}
    Job Description: {job_description[:1000]}
    Match Explanation:
    """
    
    return await call_hf_with_failover(prompt)

@retry_with_backoff(retries=5)
async def get_improvement_suggestions(missing_skills: Optional[List[str]]) -> str:
    """Provide a brief learning plan or improvement areas."""
    if not settings.HUGGING_FACE_API_TOKEN:
        return "Improvement plan unavailable (API token missing)."
    
    if not missing_skills:
        return "You have all the key skills! Focus on refining your current portfolio."

    prompt = f"""
    Based on these missing skills for a job, create a very brief 3-step learning plan or improvement focus areas.
    Missing Skills: {', '.join(missing_skills)}
    Improvement Plan:
    """
    
    return await call_hf_with_failover(prompt, max_tokens=200)
