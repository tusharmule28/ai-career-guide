import os
from dotenv import load_dotenv

# Try to load .env from the current directory (assuming we run from backend)
load_dotenv(".env")

print(f"DATABASE_URL from os.environ: {os.environ.get('DATABASE_URL')}")
