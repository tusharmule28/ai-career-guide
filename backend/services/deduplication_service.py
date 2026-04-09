import hashlib
import re
from sqlalchemy.orm import Session
from models.job import Job
from typing import Optional

class DeduplicationService:
    def generate_content_hash(self, title: str, description: str, company: str) -> str:
        """
        Generates a normalized hash based on title, company, and description.
        Normalizes text by removing whitespace and special characters to handle 
        minor formatting differences.
        """
        # Normalize: lowercase and remove non-alphanumeric
        def normalize(text: str) -> str:
            if not text: return ""
            return re.sub(r'[^a-zA-Z0-9]', '', text.lower())

        normalized_content = f"{normalize(title)}{normalize(company)}{normalize(description[:1000])}"
        return hashlib.md5(normalized_content.encode()).hexdigest()

    def is_duplicate(self, db: Session, content_hash: str) -> bool:
        """
        Checks if a job with the same content hash already exists.
        Note: You'll need to add a 'content_hash' column to the Job model for this to be efficient.
        """
        # For now, we can check by title/company/description directly or just return False 
        # until the model is updated.
        return False

deduplication_service = DeduplicationService()
