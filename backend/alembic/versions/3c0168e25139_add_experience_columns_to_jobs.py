"""Add experience columns and missing tables

Revision ID: 3c0168e25139
Revises: 9d3183f5efa1
Create Date: 2026-04-07 03:40:41.505671

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import pgvector.sqlalchemy


# revision identifiers, used by Alembic.
revision: str = '3c0168e25139'
down_revision: Union[str, Sequence[str], None] = '9d3183f5efa1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create match_results table (if missing)
    op.create_table('match_results',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('resume_id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.Integer(), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('matched_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_match_results_id'), 'match_results', ['id'], unique=False)

    # 2. Add columns to jobs (TRULY missing)
    op.add_column('jobs', sa.Column('experience_min', sa.Integer(), nullable=True))
    op.add_column('jobs', sa.Column('experience_max', sa.Integer(), nullable=True))
    
    # 3. Add embedding to resumes (missing)
    op.add_column('resumes', sa.Column('embedding', pgvector.sqlalchemy.Vector(384), nullable=True))

    # 4. Add columns to users (missing)
    op.add_column('users', sa.Column('full_name', sa.String(), nullable=True))
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=True))
    op.add_column('users', sa.Column('is_superuser', sa.Boolean(), nullable=True))
    op.add_column('users', sa.Column('bio', sa.String(), nullable=True))
    op.add_column('users', sa.Column('profile_picture', sa.String(), nullable=True))
    op.add_column('users', sa.Column('social_links', sa.String(), nullable=True))
    op.add_column('users', sa.Column('location', sa.String(), nullable=True))
    op.add_column('users', sa.Column('job_title', sa.String(), nullable=True))
    op.add_column('users', sa.Column('skills', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'skills')
    op.drop_column('users', 'job_title')
    op.drop_column('users', 'location')
    op.drop_column('users', 'social_links')
    op.drop_column('users', 'profile_picture')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'is_superuser')
    op.drop_column('users', 'is_active')
    op.drop_column('users', 'full_name')
    op.drop_column('resumes', 'embedding')
    op.drop_column('jobs', 'experience_max')
    op.drop_column('jobs', 'experience_min')
    op.drop_index(op.f('ix_match_results_id'), table_name='match_results')
    op.drop_table('match_results')
