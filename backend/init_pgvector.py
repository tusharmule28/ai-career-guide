import sqlalchemy
from core.config import settings
from db.database import Base
from models.job import Job
from models.resume import Resume

def init_vector_extension():
    engine = sqlalchemy.create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        conn.execute(sqlalchemy.text("CREATE EXTENSION IF NOT EXISTS vector;"))
        conn.commit()
    
    # Create tables (adds new columns)
    Base.metadata.create_all(bind=engine)
    print("Vector extension enabled and tables created.")

if __name__ == "__main__":
    try:
        init_vector_extension()
    except Exception as e:
        print(f"Error enabling vector extension: {e}")
