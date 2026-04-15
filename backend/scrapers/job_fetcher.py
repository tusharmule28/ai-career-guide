import httpx
import logging
import asyncio
import pandas as pd
import gc
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from models.job import Job
from services.embedding_service import embedding_service
from jobspy import scrape_jobs
from scrapers.indian_jobs_scraper import indian_jobs_scraper
from services.deduplication_service import deduplication_service

logger = logging.getLogger(__name__)

class JobFetcher:
    def __init__(self):
        self.remotive_url = "https://remotive.com/api/remote-jobs?limit=20"
        self.wwr_rss_url = "https://weworkremotely.com/remote-jobs.rss"

    async def fetch_india_jobs(self, search_term: str = "Software Engineer", limit: int = 10) -> List[Dict[str, Any]]:
        """
        Fetch jobs from LinkedIn and Indeed for India using JobSpy.
        Optimized to reduce memory overhead.
        """
        try:
            logger.info(f"Scraping '{search_term}' jobs in India...")
            
            def do_scrape():
                return scrape_jobs(
                    site_name=["linkedin", "indeed"], 
                    search_term=search_term,
                    location="India",
                    results_wanted=limit,
                    hours_old=72,
                    country_indeed='india',
                )

            loop = asyncio.get_event_loop()
            df = await loop.run_in_executor(None, do_scrape)
            
            if df is None or df.empty:
                logger.warning(f"No jobs found for '{search_term}'.")
                return []

            formatted_jobs = []
            for _, row in df.iterrows():
                # Truncate description immediately to save memory
                raw_desc = str(row['description']) if pd.notna(row['description']) else ""
                description = raw_desc[:5000] # Safe truncation early
                
                formatted_jobs.append({
                    "external_id": f"jobspy_{row['id']}",
                    "title": row['title'],
                    "company": row['company'],
                    "description": description,
                    "location": row['location'] if pd.notna(row['location']) else "India",
                    "apply_url": row['job_url'],
                    "source": row['site'],
                    "required_skills": []
                })
            
            # Proactive cleanup of the dataframe
            del df
            gc.collect()
            
            return formatted_jobs
        except Exception as e:
            logger.error(f"Error fetching from JobSpy for '{search_term}': {e}")
            return []

    async def sync_jobs(self, db: Session) -> List[Job]:
        """
        Fetch jobs from all sources and save new ones to the database.
        Optimized for memory-constrained environments (Render).
        """
        logger.info("Starting Job Sync: Optimizing for memory constraints...")
        
        # 1. IndianJobsScraper (Playwright) - Close aggressively
        try:
            await indian_jobs_scraper.run_sync(db)
            gc.collect() # Cleanup after Playwright
        except Exception as e:
            logger.error(f"IndianJobsScraper failed: {e}")

        # 2. Reduced search breadth for JobSpy to prevent growth of memory footprint
        search_terms = ["Software Engineer", "Frontend Developer", "Backend Developer"]
        # Prioritize major hubs only
        indian_hubs = ["Bangalore", "Hyderabad", "Remote, India"]
        
        new_jobs = []
        for city in indian_hubs:
            for term in search_terms:
                jobs_data = await self.fetch_india_jobs(search_term=f"{term} {city}", limit=5)
                
                if not jobs_data:
                    continue
                
                for job_data in jobs_data:
                    # Check for existing job by external_id (Fast)
                    existing_id = db.query(Job).filter(Job.external_id == job_data["external_id"]).first()
                    if existing_id:
                        continue
                    
                    # Check for duplicate content (Robust)
                    content_hash = deduplication_service.generate_content_hash(
                        job_data["title"], 
                        job_data["description"], 
                        job_data["company"]
                    )
                    existing_hash = db.query(Job).filter(Job.content_hash == content_hash).first()
                    if existing_hash:
                        continue

                    # Create new job
                    new_job = Job(
                        external_id=job_data["external_id"],
                        content_hash=content_hash,
                        title=job_data["title"],
                        company=job_data["company"],
                        description=job_data["description"],
                        location=job_data["location"],
                        apply_url=job_data["apply_url"],
                        source=job_data["source"],
                        required_skills=job_data["required_skills"],
                        work_type="On-site",
                        company_logo=f"https://ui-avatars.com/api/?name={job_data['company'].replace(' ', '+')}&background=random"
                    )
                    
                    # Generate embedding
                    content_to_embed = f"{new_job.title} {new_job.description[:1500]}" 
                    try:
                        embedding = await embedding_service.generate_embedding(content_to_embed)
                        new_job.embedding = embedding.tolist()
                        
                        db.add(new_job)
                        new_jobs.append(new_job)
                    except Exception as e:
                        logger.error(f"Failed to generate embedding for job {new_job.external_id}: {e}")
                        continue
                
                # Commit in smaller chunks to free up DB session memory
                if len(new_jobs) >= 5:
                    db.commit()
                    logger.info(f"Committed {len(new_jobs)} jobs. Cleaning memory...")
                    new_jobs = [] 
                    gc.collect()

                # Politeness delay & and extra breathing room for GC
                await asyncio.sleep(8)
                gc.collect()
        
        # Final commit for remaining
        if len(new_jobs) > 0:
            db.commit()
            logger.info(f"Final commit of {len(new_jobs)} jobs.")
            gc.collect()
        
        return [] # We return an empty list or just use the DB directly

job_fetcher = JobFetcher()
