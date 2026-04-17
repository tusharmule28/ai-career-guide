import httpx
import numpy as np
from typing import List, Union, Optional
from core.config import settings
import logging

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self, model_id: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.primary_model = model_id
        self.fallback_model = "sentence-transformers/paraphrase-MiniLM-L3-v2" # Tiny 45MB fallback
        self.api_url = f"https://router.huggingface.co/hf-inference/models/{self.primary_model}/pipeline/feature-extraction"
        self.fallback_url = f"https://router.huggingface.co/hf-inference/models/{self.fallback_model}/pipeline/feature-extraction"
        self.headers = {"Authorization": f"Bearer {settings.HUGGING_FACE_API_TOKEN}"}
        self._client: Optional[httpx.AsyncClient] = None

    async def get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=15.0, limits=httpx.Limits(max_connections=10, max_keepalive_connections=5))
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def generate_embedding(self, text: Union[str, List[str]], use_fallback: bool = False) -> np.ndarray:
        if not text:
            return np.zeros(384)
        
        target_url = self.fallback_url if use_fallback else self.api_url
        
        # Enhanced preprocessing for better "Experience"
        if isinstance(text, str):
            payload = {"inputs": text.strip()[:1500]} # Safe truncation
        elif isinstance(text, list):
            payload = {"inputs": [t.strip()[:1000] for t in text if t.strip()]}
            
        try:
            client = await self.get_client()
            response = await client.post(target_url, headers=self.headers, json=payload)
            
            # If primary overloaded/fails, try fallback model immediately
            if response.status_code != 200 and not use_fallback:
                logger.warning(f"Primary AI model {self.primary_model} busy/failed. Failover to {self.fallback_model}...")
                return await self.generate_embedding(text, use_fallback=True)
            
            response.raise_for_status()
            embeddings = response.json()
            return np.array(embeddings)
        except Exception as e:
            if not use_fallback:
                return await self.generate_embedding(text, use_fallback=True)
            logger.error(f"AI Failure: All models exhausted. Using static zero-vector. {e}")
            return np.zeros(384)

# Singleton instance
embedding_service = EmbeddingService()
