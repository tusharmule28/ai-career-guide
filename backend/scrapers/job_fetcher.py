import httpx
import logging
import asyncio
import pandas as pd
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from models.job import Job
from services.embedding_service import embedding_service
from jobspy import scrape_jobs
from scrapers.indian_jobs_scraper import indian_jobs_scraper

logger = logging.getLogger(__name__)

class JobFetcher:
    def __init__(self):
        self.remotive_url = "https://remotive.com/api/remote-jobs?limit=20"
        self.wwr_rss_url = "https://weworkremotely.com/remote-jobs.rss"

    async def fetch_india_jobs(self, search_term: str = "Software Engineer", limit: int = 20) -> List[Dict[str, Any]]:
        """
        Fetch jobs from LinkedIn, Indeed, Glassdoor, and Google for India using JobSpy.
        """
        try:
            logger.info(f"Scraping '{search_term}' jobs in India...")
            # JobSpy is synchronous, run in executor to avoid blocking event loop
            def do_scrape():
                return scrape_jobs(
                    site_name=["linkedin", "indeed", "google"], # Removed Glassdoor due to 403 blocks
                    search_term=search_term,
                    location="India",
                    results_wanted=limit,
                    hours_old=72, # Last 3 days
                    country_indeed='india',
                )

            loop = asyncio.get_event_loop()
            df = await loop.run_in_executor(None, do_scrape)
            
            if df is None or df.empty:
                logger.warning(f"No jobs found for '{search_term}' in India.")
                return []

            formatted_jobs = []
            for _, row in df.iterrows():
                # Ensure description is a string and not NaN
                description = str(row['description']) if pd.notna(row['description']) else ""
                
                formatted_jobs.append({
                    "external_id": f"jobspy_{row['id']}",
                    "title": row['title'],
                    "company": row['company'],
                    "description": description,
                    "location": row['location'] if pd.notna(row['location']) else "India",
                    "apply_url": row['job_url'],
                    "source": row['site'],
                    "required_skills": [] # JobSpy doesn't provide structured tags easily
                })
            return formatted_jobs
        except Exception as e:
            logger.error(f"Error fetching from JobSpy for '{search_term}': {e}")
            return []

    async def fetch_remotive_jobs(self) -> List[Dict[str, Any]]:
        """
        Fetch jobs from Remotive.io API.
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(self.remotive_url)
                response.raise_for_status()
                data = response.json()
                jobs = data.get("jobs", [])
                
                formatted_jobs = []
                for job in jobs:
                    formatted_jobs.append({
                        "external_id": f"remotive_{job.get('id')}",
                        "title": job.get("title"),
                        "company": job.get("company_name"),
                        "description": job.get("description"),
                        "location": job.get("candidate_required_location"),
                        "apply_url": job.get("url"),
                        "source": "Remotive",
                        "required_skills": job.get("tags", [])
                    })
                return formatted_jobs
        except Exception as e:
            logger.error(f"Error fetching from Remotive: {e}")
            return []

    async def fetch_wwr_jobs(self) -> List[Dict[str, Any]]:
        """
        Fetch jobs from We Work Remotely RSS feed.
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(self.wwr_rss_url)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, "xml")
                items = soup.find_all("item")
                
                formatted_jobs = []
                for item in items[:20]: # Limit reach
                    formatted_jobs.append({
                        "external_id": f"wwr_{item.find('guid').text if item.find('guid') else item.find('link').text}",
                        "title": item.find("title").text,
                        "company": item.find("dc:creator").text if item.find("dc:creator") else "Remote Company",
                        "description": item.find("description").text,
                        "location": "Remote",
                        "apply_url": item.find("link").text,
                        "source": "WWR",
                        "required_skills": [] # RSS doesn't give tags easily
                    })
                return formatted_jobs
        except Exception as e:
            logger.error(f"Error fetching from WWR: {e}")
            return []

    async def sync_jobs(self, db: Session):
        """
        Fetch jobs from all sources and save new ones to the database.
        """
        logger.info("Starting job synchronization for Indian market...")
        
        # Search for a few popular categories in India
        search_terms = ["Software Engineer", "Full Stack Developer", "Data Scientist", "Python Developer"]
        
        all_fetched_jobs = []
        for term in search_terms:
            jobs = await self.fetch_india_jobs(search_term=term, limit=15)
            all_fetched_jobs.extend(jobs)
            # Politeness delay
            await asyncio.sleep(2)
        
        # Also keep original sources for diversity if needed, 
        # but the user specifically asked for real-time India matching.
        # remotive_jobs = await self.fetch_remotive_jobs()
        # wwr_jobs = await self.fetch_wwr_jobs()
        # all_fetched_jobs.extend(remotive_jobs)
        # all_fetched_jobs.extend(wwr_jobs)
        
        logger.info(f"Fetched total of {len(all_fetched_jobs)} jobs.")

        new_jobs_count = 0
        for job_data in all_fetched_jobs:
            # Check for existing job
            existing_job = db.query(Job).filter(Job.external_id == job_data["external_id"]).first()
            if existing_job:
                continue

            # Create new job
            new_job = Job(
                external_id=job_data["external_id"],
                title=job_data["title"],
                company=job_data["company"],
                description=job_data["description"][:10000],
                location=job_data["location"],
                apply_url=job_data["apply_url"],
                source=job_data["source"],
                required_skills=job_data["required_skills"],
                salary_min=None,
                salary_max=None,
                work_type="On-site",
                company_logo=f"https://ui-avatars.com/api/?name={job_data['company'].replace(' ', '+')}&background=random"
            )
            
            # Generate embedding for the new job
            # Combine title and description for embedding
            content_to_embed = f"{new_job.title} {new_job.description[:2000]}" 
            try:
                embedding = await embedding_service.generate_embedding(content_to_embed)
                new_job.embedding = embedding.tolist()
                
                db.add(new_job)
                new_jobs_count += 1
            except Exception as e:
                logger.error(f"Failed to generate embedding for job {new_job.external_id}: {e}")
                continue

        if new_jobs_count > 0:
            db.commit()
            logger.info(f"Successfully synced {new_jobs_count} new Indian jobs.")
        else:
            logger.info("No new jobs to sync.")

job_fetcher = JobFetcher()
