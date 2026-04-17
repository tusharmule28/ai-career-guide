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

    async def sync_jobs(self, db: Session, user_location: Optional[str] = None) -> List[Job]:
        """
        Fetch jobs from all sources and save new ones to the database.
        Optimized for memory-constrained environments (Render).
        Targeted scanning based on user_location to prioritize local hubs.
        """
        logger.info(f"Starting Job Sync: Targeting {user_location or 'Global'} Intel...")
        
        # 1. IndianJobsScraper (Playwright) - Close aggressively
        try:
            await indian_jobs_scraper.run_sync(db)
            gc.collect() 
        except Exception as e:
            logger.error(f"IndianJobsScraper failed: {e}")

        # 2. Dynamic Targeted Scanning
        base_search_terms = ["Software Engineer", "Frontend Developer", "Backend Developer"]
        
        # Determine target cities based on user location
        target_hubs = []
        is_india_user = False
        
        if user_location:
            loc_lower = user_location.lower()
            if "india" in loc_lower:
                is_india_user = True
                # Extract city if possible
                city = user_location.split(",")[0].strip()
                if city and len(city) > 2:
                    target_hubs.append(city)
                # Always include major hubs for India users
                target_hubs.extend(["Bangalore", "Hyderabad", "Remote, India"])
            else:
                # Global/US user
                city = user_location.split(",")[0].strip()
                if city: target_hubs.append(city)
                target_hubs.extend(["Remote", "London", "San Francisco"])
        else:
            # Default fallback
            target_hubs = ["Bangalore", "Remote, India", "Remote"]

        # Deduplicate and limit hubs to save memory
        target_hubs = list(dict.fromkeys(target_hubs))[:4] 
        
        new_jobs = []
        for city in target_hubs:
            for term in base_search_terms:
                # Logic: Fetch fewer results per combination but more relevant
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
                        work_type="Remote" if "remote" in city.lower() else "On-site",
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
                
                # Proactive cleanup
                if len(new_jobs) >= 5:
                    db.commit()
                    new_jobs = [] 
                    gc.collect()

                # Optimized delay for free tier
                await asyncio.sleep(10)
                gc.collect()
        
        # Final cleanup
        if len(new_jobs) > 0:
            db.commit()
            gc.collect()
        
        return []

job_fetcher = JobFetcher()
