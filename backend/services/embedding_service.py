import httpx
import numpy as np
from typing import List, Union, Optional
from core.config import settings
import logging

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self, model_id: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """
        Initialize the embedding service using Hugging Face Inference API.
        """
        self.model_id = model_id
        self.api_url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{model_id}"
        self.headers = {"Authorization": f"Bearer {settings.HUGGING_FACE_API_TOKEN}"}

    async def generate_embedding(self, text: Union[str, List[str]]) -> np.ndarray:
        """
        Generate embedding for a single text or a list of texts using Hugging Face API.
        Returns a numpy array of embeddings.
        """
        if not text:
            return np.array([])
        
        # Ensure text is clean
        if isinstance(text, str):
            payload = {"inputs": text.strip()}
        elif isinstance(text, list):
            payload = {"inputs": [t.strip() for t in text if t.strip()]}
            
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.api_url, headers=self.headers, json=payload)
                response.raise_for_status()
                embeddings = response.json()
                
                return np.array(embeddings)
        except Exception as e:
            logger.error(f"Error calling Hugging Face API: {e}")
            raise e

# Singleton instance
embedding_service = EmbeddingService()
