import json
import re
from typing import List, Set
from huggingface_hub import InferenceClient
from core.config import settings
from core.utils import retry_with_backoff

def clean_skills(skills_list: List[str]) -> List[str]:
    """Clean and normalize skill strings."""
    return sorted(list(set(skill.strip().lower() for skill in skills_list if skill.strip())))

@retry_with_backoff(retries=3)
async def extract_skills_hf(text: str) -> List[str]:
    """Extract skills from text using Hugging Face Inference API."""
    if not settings.HUGGING_FACE_API_TOKEN:
        # Fallback to simple keyword matching if token isn't provided yet
        # For now, we'll just return an empty list or a very basic matching
        return []

    client = InferenceClient(api_key=settings.HUGGING_FACE_API_TOKEN)
    
    prompt = f"""
    Extract a list of technical and soft skills from the following text. 
    Return ONLY a JSON list of strings.
    Text: {text}
    """
    
    try:
        # Using a reliable model for extraction
        response = client.text_generation(
            prompt,
            model="mistralai/Mistral-7B-Instruct-v0.2",
            max_new_tokens=500,
            temperature=0.1
        )
        
        # Try to find JSON in the response
        match = re.search(r'\[.*\]', response, re.DOTALL)
        if match:
            skills = json.loads(match.group())
            return clean_skills(skills)
    except Exception as e:
        print(f"Error calling Hugging Face API: {e}")
    
    return []

async def analyze_skill_gap(resume_text: str, job_description: str) -> dict:
    """Analyze the gap between resume skills and job description skills."""
    
    # Extract skills from both
    resume_skills = await extract_skills_hf(resume_text)
    job_skills = await extract_skills_hf(job_description)
    
    # If API failed, we can't do much without a local fallback
    # For now, let's assume the API works or user will provide token
    
    resume_set = set(resume_skills)
    job_set = set(job_skills)
    
    missing_skills = list(job_set - resume_set)
    
    return {
        "resume_skills": resume_skills,
        "job_skills": job_skills,
        "missing_skills": sorted(missing_skills)
    }
