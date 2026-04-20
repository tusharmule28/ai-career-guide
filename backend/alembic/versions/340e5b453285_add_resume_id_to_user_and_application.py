"""add resume_id to user and application

Revision ID: 340e5b453285
Revises: 4c1473a07fcd
Create Date: 2026-04-20 11:39:44.571036

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '340e5b453285'
down_revision: Union[str, Sequence[str], None] = '4c1473a07fcd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: Add resume_id to users and applications."""
    # 1. Add resume_id to users
    op.add_column('users', sa.Column('resume_id', sa.Integer(), sa.ForeignKey('resumes.id'), nullable=True))
    
    # 2. Add resume_id to applications
    op.add_column('applications', sa.Column('resume_id', sa.Integer(), sa.ForeignKey('resumes.id'), nullable=True))


def downgrade() -> None:
    """Downgrade schema: Remove resume_id from users and applications."""
    op.drop_column('applications', 'resume_id')
    op.drop_column('users', 'resume_id')
