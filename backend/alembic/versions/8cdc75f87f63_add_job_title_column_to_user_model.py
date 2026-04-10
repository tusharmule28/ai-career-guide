"""Add job_title column to User model

Revision ID: 8cdc75f87f63
Revises: 065b5602e213
Create Date: 2026-04-10 19:01:02.376558

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8cdc75f87f63'
down_revision: Union[str, Sequence[str], None] = '065b5602e213'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('job_title', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'job_title')
