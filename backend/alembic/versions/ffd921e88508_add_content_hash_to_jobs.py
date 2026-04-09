"""add_content_hash_to_jobs

Revision ID: ffd921e88508
Revises: ba6b41b7b772
Create Date: 2026-04-10 01:31:28.805957

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ffd921e88508'
down_revision: Union[str, Sequence[str], None] = 'ba6b41b7b772'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add content_hash column to jobs table."""
    op.add_column('jobs', sa.Column('content_hash', sa.String(), nullable=True))
    op.create_index(op.f('ix_jobs_content_hash'), 'jobs', ['content_hash'], unique=True)


def downgrade() -> None:
    """Remove content_hash column from jobs table."""
    op.drop_index(op.f('ix_jobs_content_hash'), table_name='jobs')
    op.drop_column('jobs', 'content_hash')
