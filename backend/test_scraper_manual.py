import asyncio
from db.database import SessionLocal
from scrapers.indian_jobs_scraper import indian_jobs_scraper

async def test_scraper():
    db = SessionLocal()
    try:
        print("Testing Indian Job Scraper...")
        await indian_jobs_scraper.run_sync(db)
        print("Scraper test completed.")
    except Exception as e:
        print(f"Scraper test failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_scraper())
