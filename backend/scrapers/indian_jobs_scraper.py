import asyncio
import logging
import json
import hashlib
import gc
from datetime import datetime
from typing import List, Dict, Any, Optional
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from models.job import Job
from services.embedding_service import embedding_service

from core.utils import parse_experience

logger = logging.getLogger(__name__)

class IndianJobsScraper:
    def __init__(self):
        self.browser_type = "chromium"
        self.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        # High-traffic Indian career pages or aggregators
        self.targets = [
            {"url": "https://in.indeed.com/jobs?q=software+engineer&l=India&fromage=1", "name": "Indeed India"},
            # More targets can be added here
        ]

    async def scrape_indeed_india(self, page) -> List[Dict[str, Any]]:
        """Scrape Indeed India for the latest jobs."""
        jobs = []
        try:
            logger.info("Navigating to Indeed India...")
            # Reduced timeout and added more robust wait
            await page.goto(self.targets[0]["url"], wait_until="domcontentloaded", timeout=30000)
            
            # Wait for specific element instead of generic networkidle
            try:
                await page.wait_for_selector(".job_seen_beacon", timeout=10000)
            except Exception:
                logger.warning("Timeout waiting for job cards. Page might be restricted or slow.")

            # Scroll to load more with a small limit
            await page.evaluate("window.scrollTo(0, 1000)")
            await asyncio.sleep(1)

            content = await page.content()
            soup = BeautifulSoup(content, "html.parser")
            
            # Indeed specific selectors (Note: these change frequently)
            job_cards = soup.select(".job_seen_beacon")
            logger.info(f"Found {len(job_cards)} job cards on Indeed.")

            for card in job_cards:
                try:
                    title_elem = card.select_one("h2.jobTitle span")
                    company_elem = card.select_one("[data-testid='company-name']")
                    location_elem = card.select_one("[data-testid='text-location']")
                    link_elem = card.select_one("h2.jobTitle a")
                    snippet_elem = card.select_one(".job-snippet")
                    salary_elem = card.select_one(".salary-snippet-container") or card.select_one(".estimated-salary")

                    if not title_elem or not link_elem:
                        continue

                    job_url = "https://in.indeed.com" + link_elem["href"]
                    
                    # Deduplication ID
                    external_id = hashlib.md5(job_url.encode()).hexdigest()

                    # Simple salary parsing logic
                    salary_min, salary_max = None, None
                    if salary_elem:
                        salary_text = salary_elem.get_text(strip=True)
                        # Very crude parser for demo purposes
                        import re
                        numbers = re.findall(r'\d+', salary_text.replace(',', ''))
                        if len(numbers) >= 2:
                            salary_min, salary_max = int(numbers[0]), int(numbers[1])
                        elif len(numbers) == 1:
                            salary_min = int(numbers[0])

                    # Simple work-type detection
                    work_type = "On-site"
                    if "remote" in location_elem.get_text(strip=True).lower() or "remote" in title_elem.get_text(strip=True).lower():
                        work_type = "Remote"
                    elif "hybrid" in location_elem.get_text(strip=True).lower():
                        work_type = "Hybrid"

                    desc_text = snippet_elem.get_text(strip=True) if snippet_elem else ""
                    exp_min, exp_max = parse_experience(desc_text)

                    jobs.append({
                        "title": title_elem.get_text(strip=True),
                        "company": company_elem.get_text(strip=True) if company_elem else "Unknown",
                        "location": location_elem.get_text(strip=True) if location_elem else "India",
                        "description": desc_text or "No description provided.",
                        "apply_url": job_url,
                        "external_id": external_id,
                        "source": "Indeed India",
                        "required_skills": [], 
                        "experience_min": exp_min,    
                        "experience_max": exp_max,
                        "salary_min": salary_min,
                        "salary_max": salary_max,
                        "work_type": work_type,
                        "company_logo": f"https://ui-avatars.com/api/?name={company_elem.get_text(strip=True) if company_elem else 'U'}&background=random"
                    })
                except Exception as e:
                    logger.error(f"Error parsing job card: {e}")
                    continue

        except Exception as e:
            logger.error(f"Error scraping Indeed India: {e}")
        
        return jobs

    async def run_sync(self, db: Session):
        """Main entry point for the scraper."""
        logger.info("Starting Indian Job Scraper (Playwright)...")
        
        async with async_playwright() as p:
            browser = await p[self.browser_type].launch(headless=True)
            context = await browser.new_context(user_agent=self.user_agent)
            page = await context.new_page()

            # Memory Optimization: Block heavy/unnecessary resources
            await page.route("**/*.{png,jpg,jpeg,gif,svg,css,woff,woff2,ttf,otf,ico}", lambda route: route.abort())
            # Block tracking and ads to save bandwidth and memory
            await page.route("**/google-analytics.com/**", lambda route: route.abort())
            await page.route("**/doubleclick.net/**", lambda route: route.abort())

            fetched_jobs = await self.scrape_indeed_india(page)
            
            await browser.close()

            logger.info(f"Fetched {len(fetched_jobs)} jobs from Indeed India.")

            new_jobs_count = 0
            for job_data in fetched_jobs:
                # Check for existing
                existing = db.query(Job).filter(Job.external_id == job_data["external_id"]).first()
                if existing:
                    continue

                # Create Job object
                new_job = Job(
                    title=job_data["title"],
                    company=job_data["company"],
                    location=job_data["location"],
                    description=job_data["description"],
                    apply_url=job_data["apply_url"],
                    external_id=job_data["external_id"],
                    source=job_data["source"],
                    required_skills=job_data["required_skills"],
                    experience_min=job_data["experience_min"],
                    experience_max=job_data["experience_max"],
                    salary_min=job_data["salary_min"],
                    salary_max=job_data["salary_max"],
                    work_type=job_data["work_type"],
                    company_logo=job_data["company_logo"]
                )

                # Generate embedding
                try:
                    content = f"{new_job.title} {new_job.description}"
                    embedding = await embedding_service.generate_embedding(content)
                    new_job.embedding = embedding.tolist()
                    
                    db.add(new_job)
                    new_jobs_count += 1
                except Exception as e:
                    logger.error(f"Embedding failed for {new_job.external_id}: {e}")
                    continue

            if new_jobs_count > 0:
                db.commit()
                logger.info(f"Successfully synced {new_jobs_count} new jobs.")
            else:
                logger.info("No new jobs found.")
            
            # Explicit cleanup
            gc.collect()

indian_jobs_scraper = IndianJobsScraper()
