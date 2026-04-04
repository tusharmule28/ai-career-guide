import asyncio
from services.embedding_service import embedding_service

async def main():
    try:
        emb = await embedding_service.generate_embedding("test")
        print("Success:", emb.shape)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())
