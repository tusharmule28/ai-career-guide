import azure.cosmos.cosmos_client as cosmos_client
import azure.cosmos.exceptions as exceptions
import hashlib
import json
import logging
from typing import Any, Optional
from core.config import settings

logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self):
        self.client = None
        self.container = None
        
        if settings.AZURE_COSMOS_CONNECTION_STRING:
            try:
                self.client = cosmos_client.CosmosClient.from_connection_string(settings.AZURE_COSMOS_CONNECTION_STRING)
                # Create DB and Container if they don't exist (Always Free tier supports this)
                db = self.client.create_database_if_not_exists(id=settings.AZURE_COSMOS_DATABASE_ID)
                self.container = db.create_container_if_not_exists(
                    id=settings.AZURE_COSMOS_CONTAINER_ID,
                    partition_key=azure.cosmos.PartitionKey(path="/id"),
                    offer_throughput=400 # Minimal RU for free tier
                )
            except Exception as e:
                logger.error(f"Failed to initialize Azure Cosmos DB: {e}")

    def _generate_key(self, text: str) -> str:
        """Generates a unique MD5 hash for the given text."""
        return hashlib.md5(text.encode('utf-8')).hexdigest()

    async def get_embedding(self, text: str) -> Optional[list]:
        """Retrieves cached embedding from Cosmos DB."""
        if not self.container:
            return None
            
        try:
            key = f"EMB#{self._generate_key(text)}"
            item = self.container.read_item(item=key, partition_key=key)
            if item and 'vector' in item:
                return json.loads(item['vector'])
        except exceptions.CosmosResourceNotFoundError:
            return None
        except Exception as e:
            logger.error(f"Error reading from Cosmos DB: {e}")
        return None

    async def save_embedding(self, text: str, vector: list):
        """Saves embedding to Cosmos DB."""
        if not self.container:
            return
            
        try:
            key = f"EMB#{self._generate_key(text)}"
            self.container.upsert_item(
                body={
                    'id': key, # Cosmos uses 'id' as primary key
                    'text_snippet': text[:100],
                    'vector': json.dumps(vector),
                    'created_at': str(json.dumps(True))
                }
            )
        except Exception as e:
            logger.error(f"Error writing to Cosmos DB: {e}")

cache_service = CacheService()
