"""add_premium_fields_to_user

Revision ID: 065b5602e213
Revises: ffd921e88508
Create Date: 2026-04-10 01:36:24.397975

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '065b5602e213'
down_revision: Union[str, Sequence[str], None] = 'ffd921e88508'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add premium subscription fields to users table."""
    op.add_column('users', sa.Column('is_premium', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('users', sa.Column('premium_until', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('razorpay_customer_id', sa.String(), nullable=True))


def downgrade() -> None:
    """Remove premium subscription fields from users table."""
    op.drop_column('users', 'razorpay_customer_id')
    op.drop_column('users', 'premium_until')
    op.drop_column('users', 'is_premium')
