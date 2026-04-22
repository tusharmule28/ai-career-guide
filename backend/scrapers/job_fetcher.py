import httpx
import logging
import asyncio
import gc
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from models.job import Job
from services.embedding_service import embedding_service
from jobspy import scrape_jobs
from scrapers.indian_jobs_scraper import indian_jobs_scraper
from services.deduplication_service import deduplication_service
from core.utils import parse_experience

logger = logging.getLogger(__name__)

class JobFetcher:
    def __init__(self):
        self.remotive_url = "https://remotive.com/api/remote-jobs?limit=20"
        self.wwr_rss_url = "https://weworkremotely.com/remote-jobs.rss"

    async def fetch_india_jobs(self, search_term: str = "Software Engineer", limit: int = 15, hours_old: int = 24) -> List[Dict[str, Any]]:
        """
        Fetch jobs from LinkedIn and Indeed for India using JobSpy.
        Optimized to reduce memory overhead and prioritize fresh results.
        """
        try:
            logger.info(f"Scraping '{search_term}' jobs in India (last {hours_old}h)...")
            
            def do_scrape():
                return scrape_jobs(
                    site_name=["linkedin", "indeed", "google"], 
                    search_term=search_term,
                    location="India",
                    results_wanted=limit + 5,
                    hours_old=hours_old,
                    country_indeed='india',
                )

            loop = asyncio.get_event_loop()
            df = await loop.run_in_executor(None, do_scrape)
            
            if df is None or len(df) == 0:
                logger.warning(f"No jobs found for '{search_term}'.")
                return []

            # Convert to list of dicts immediately and dump the DF
            jobs_list = df.to_dict('records')
            del df
            gc.collect()

            formatted_jobs = []
            for row in jobs_list:
                # Truncate description immediately to save memory
                raw_desc = str(row.get('description', ''))
                description = raw_desc[:5000] if raw_desc else ""
                
                formatted_jobs.append({
                    "external_id": f"jobspy_{row.get('id', '')}",
                    "title": row.get('title', 'Unknown'),
                    "company": row.get('company', 'Unknown'),
                    "description": description,
                    "location": row.get('location', 'India') if row.get('location') else "India",
                    "apply_url": row.get('job_url', ''),
                    "source": row.get('site', 'JobSpy'),
                    "required_skills": []
                })
            
            return formatted_jobs
        except Exception as e:
            logger.error(f"Error fetching from JobSpy for '{search_term}': {e}")
            return []

    async def sync_jobs(self, db: Session, user_location: Optional[str] = None, force_sync: bool = False) -> List[Job]:
        """
        Fetch jobs from all sources and save new ones to the database.
        Optimized for memory-constrained environments (Render).
        Adds a 4-hour cooldown unless force_sync is True.
        """
        from datetime import datetime, timedelta, timezone
        
        # 0. Cooldown logic (default 4 hours)
        if not force_sync:
            latest_job = db.query(Job).order_by(Job.posted_at.desc()).first()
            if latest_job and latest_job.posted_at:
                # Ensure posted_at has timezone info if needed, or assume UTC
                last_update = latest_job.posted_at
                if last_update.tzinfo is None:
                    last_update = last_update.replace(tzinfo=timezone.utc)
                
                if datetime.now(timezone.utc) - last_update < timedelta(hours=4):
                    logger.info("Skipping sync: Last update was less than 4 hours ago.")
                    return []

        logger.info(f"Starting Job Sync: Targeting {user_location or 'Global'} Intel...")
        
        # 1. IndianJobsScraper (Playwright) - Optional/Fallback
        try:
            # We only run the heavy playwright scraper if force_sync is true or as a secondary
            if force_sync:
                await indian_jobs_scraper.run_sync(db)
                gc.collect() 
        except Exception as e:
            logger.error(f"IndianJobsScraper failed: {e}")

        # 2. Dynamic Targeted Scanning
        base_search_terms = ["Software Engineer", "Frontend Developer", "Backend Developer"]
        
        # Determine target cities based on user location
        target_hubs = []
        
        if user_location:
            loc_lower = user_location.lower()
            if "india" in loc_lower:
                city = user_location.split(",")[0].strip()
                if city and len(city) > 2:
                    target_hubs.append(city)
                target_hubs.extend(["Bangalore", "Hyderabad", "Remote, India"])
            else:
                city = user_location.split(",")[0].strip()
                if city: target_hubs.append(city)
                target_hubs.extend(["Remote", "London", "San Francisco"])
        else:
            target_hubs = ["Bangalore", "Remote, India", "Remote"]

        # Deduplicate and limit hubs
        target_hubs = list(dict.fromkeys(target_hubs))[:4] 
        
        synced_jobs = []
        all_new_ids = []
        for city in target_hubs:
            for term in base_search_terms:
                # Fetch fresh jobs (last 24h)
                jobs_data = await self.fetch_india_jobs(search_term=f"{term} {city}", limit=10, hours_old=24)
                
                if not jobs_data:
                    continue
                
                for job_data in jobs_data:
                    existing_id = db.query(Job).filter(Job.external_id == job_data["external_id"]).first()
                    if existing_id:
                        continue
                    
                    content_hash = deduplication_service.generate_content_hash(
                        job_data["title"], 
                        job_data["description"], 
                        job_data["company"]
                    )
                    existing_hash = db.query(Job).filter(Job.content_hash == content_hash).first()
                    if existing_hash:
                        continue

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
                        experience_min=parse_experience(job_data["description"])[0],
                        experience_max=parse_experience(job_data["description"])[1],
                        work_type="Remote" if "remote" in city.lower() else "On-site",
                        company_logo=f"https://ui-avatars.com/api/?name={job_data['company'].replace(' ', '+')}&background=random"
                    )
                    
                    try:
                        content_to_embed = f"{new_job.title} {new_job.description[:1500]}" 
                        embedding = await embedding_service.generate_embedding(content_to_embed)
                        new_job.embedding = embedding.tolist()
                        
                        db.add(new_job)
                        db.flush()
                        synced_jobs.append(new_job)
                        all_new_ids.append(new_job.id)
                    except Exception as e:
                        logger.error(f"Failed to generate embedding for job {new_job.external_id}: {e}")
                        continue
                
                if len(synced_jobs) >= 5:
                    db.commit()
                    synced_jobs = [] 
                    gc.collect()

                # Reduced delay for better performance, still respecting rate limits
                await asyncio.sleep(5)
                gc.collect()
        
        if len(synced_jobs) > 0:
            db.commit()
            gc.collect()
        
        # Return total new jobs for notification processing
        total_new_jobs = db.query(Job).filter(Job.id.in_(all_new_ids)).all() if 'all_new_ids' in locals() and all_new_ids else []
        return total_new_jobs


job_fetcher = JobFetcher()
