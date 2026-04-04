"""add apply_url

Revision ID: 9d3183f5efa1
Revises: c31c356f7e87
Create Date: 2026-04-04 20:06:21.029190

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9d3183f5efa1'
down_revision: Union[str, Sequence[str], None] = 'c31c356f7e87'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    import pgvector.sqlalchemy
    op.add_column('jobs', sa.Column('embedding', pgvector.sqlalchemy.Vector(384), nullable=True))
    op.add_column('jobs', sa.Column('apply_url', sa.String(), nullable=True))
    op.add_column('jobs', sa.Column('source', sa.String(), nullable=True))
    op.add_column('jobs', sa.Column('external_id', sa.String(), nullable=True))
    op.create_index(op.f('ix_jobs_external_id'), 'jobs', ['external_id'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_jobs_external_id'), table_name='jobs')
    op.drop_column('jobs', 'external_id')
    op.drop_column('jobs', 'source')
    op.drop_column('jobs', 'apply_url')
    op.drop_column('jobs', 'embedding')
