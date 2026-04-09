"""add_hnsw_index_to_jobs

Revision ID: ba6b41b7b772
Revises: 3c0168e25139
Create Date: 2026-04-10 01:00:33.904055

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ba6b41b7b772'
down_revision: Union[str, Sequence[str], None] = '3c0168e25139'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add HNSW index for vector similarity optimization."""
    op.execute("CREATE INDEX idx_jobs_embedding ON jobs USING hnsw (embedding vector_cosine_ops);")


def downgrade() -> None:
    """Remove HNSW index."""
    op.drop_index('idx_jobs_embedding', table_name='jobs', postgresql_using='hnsw')
