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
        self.api_url = f"https://router.huggingface.co/hf-inference/models/{model_id}/pipeline/feature-extraction"
        self.headers = {"Authorization": f"Bearer {settings.HUGGING_FACE_API_TOKEN}"}

    async def generate_embedding(self, text: Union[str, List[str]]) -> np.ndarray:
        """
        Generate embedding for a single text or a list of texts using Hugging Face API.
        Returns a numpy array of embeddings.
        """
        if not text:
            return np.array([])
        
        # Ensure text is clean and truncated to avoid API limits (all-MiniLM-L6-v2 has a 512 token limit)
        if isinstance(text, str):
            payload = {"inputs": text.strip()[:2000]}
        elif isinstance(text, list):
            payload = {"inputs": [t.strip()[:2000] for t in text if t.strip()]}
            
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.api_url, headers=self.headers, json=payload)
                response.raise_for_status()
                embeddings = response.json()
                
                return np.array(embeddings)
        except Exception as e:
            logger.error(f"Error calling Hugging Face API: {e}. Falling back to zero-vector.")
            # If the API fails, return a graceful fallback 384-dimensional zero vector
            # (which is the dimension of all-MiniLM-L6-v2)
            return np.zeros(384)

# Singleton instance
embedding_service = EmbeddingService()
