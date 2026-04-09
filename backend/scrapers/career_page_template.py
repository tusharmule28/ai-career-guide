import logging
import asyncio
from typing import List, Dict, Any
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

class CareerPageScraper:
    """
    Template for scraping company career pages (Workday, Greenhouse, Lever, etc.)
    """
    def __init__(self, company_name: str, url: str):
        self.company_name = company_name
        self.url = url
        self.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"

    async def scrape(self) -> List[Dict[str, Any]]:
        """
        Generic scrape method. Override for specific platform logic.
        """
        logger.info(f"Opening career page for {self.company_name} at {self.url}...")
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page(user_agent=self.user_agent)
            
            try:
                await page.goto(self.url, wait_until="networkidle", timeout=60000)
                # Allow JS to render the job list
                await asyncio.sleep(3)
                
                content = await page.content()
                jobs = self._parse_content(content)
                
                await browser.close()
                return jobs
            except Exception as e:
                logger.error(f"Failed to scrape {self.company_name}: {e}")
                await browser.close()
                return []

    def _parse_content(self, html: str) -> List[Dict[str, Any]]:
        """
        Heuristic-based parser for common career page patterns.
        """
        soup = BeautifulSoup(html, "html.parser")
        jobs = []

        # Pattern 1: Lever-style (a[href*="/jobs/"])
        lever_links = soup.select('a[href*="/lever.co/"]')
        for link in lever_links:
            title_elem = link.find(['h2', 'h3', 'h4', 'span'])
            if title_elem:
                jobs.append({
                    "title": title_elem.get_text(strip=True),
                    "company": self.company_name,
                    "apply_url": link['href'],
                    "location": "Remote", # Default
                    "description": "See careers page for details."
                })

        # Pattern 2: Greenhouse (div.posting)
        gh_postings = soup.select('.posting')
        for post in gh_postings:
            title_elem = post.select_one('a[data-mapped="true"]')
            if title_elem:
                jobs.append({
                    "title": title_elem.get_text(strip=True),
                    "company": self.company_name,
                    "apply_url": "https://boards.greenhouse.io" + title_elem['href'] if title_elem['href'].startswith('/') else title_elem['href'],
                    "location": post.select_one('.location').get_text(strip=True) if post.select_one('.location') else "Remote",
                    "description": "Greenhouse posting."
                })

        return jobs
