from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Union

class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize the embedding model.
        The model is downloaded automatically on the first run.
        """
        self.model = SentenceTransformer(model_name)
    
    def generate_embedding(self, text: Union[str, List[str]]) -> np.ndarray:
        """
        Generate embedding for a single text or a list of texts.
        Returns a numpy array of embeddings.
        """
        if not text:
            return np.array([])
        
        # Ensure text is clean
        if isinstance(text, str):
            text = text.strip()
        elif isinstance(text, list):
            text = [t.strip() for t in text if t.strip()]
            
        embeddings = self.model.encode(text)
        return embeddings

# Singleton instance to avoid reloading the model for every request
embedding_service = EmbeddingService()
