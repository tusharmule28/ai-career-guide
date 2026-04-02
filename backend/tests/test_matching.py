import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.database import Base
from models.job import Job
from services.matching_service import matching_service
from services.embedding_service import embedding_service
import numpy as np

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

@pytest.fixture
def db_session():
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    # Note: pgvector doesn't work with SQLite, so we'll mock the vector search
    # for unit testing the logic if not running against actual Postgres.
    # For a true integration test, we'd use a test Postgres container.
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_embedding_generation():
    text = "Software Engineer specialized in Python"
    embedding = embedding_service.generate_embedding(text)
    assert embedding is not None
    assert len(embedding) == 384
    assert isinstance(embedding, np.ndarray)

@pytest.mark.asyncio
async def test_matching_logic_mocked(mocker, db_session):
    """
    Test that the find_matches function structures the query and results correctly.
    """
    # Create a mock job
    job = Job(
        title="Python Dev",
        company="TestCo",
        description="Python expert",
        required_skills=["Python"],
        embedding=[0.1] * 384
    )
    db_session.add(job)
    db_session.commit()

    # Mock the embedding service and the query results
    mocker.patch("services.embedding_service.embedding_service.generate_embedding", return_value=np.array([0.1]*384))
    
    # Since we use pgvector operators, we mock the query return
    mock_query = mocker.patch.object(db_session, "query")
    mock_query.return_value.filter.return_value.order_by.return_value.limit.return_value.all.return_value = [
        (job, 0.05) # Job and distance
    ]

    results = await matching_service.find_matches(db_session, "Python expert")
    
    assert len(results) == 1
    assert results[0]["job"].title == "Python Dev"
    assert results[0]["score"] > 90 # Distance 0.05 should give high score
