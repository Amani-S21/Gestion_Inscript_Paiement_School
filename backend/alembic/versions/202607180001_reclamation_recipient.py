"""add recipient to reclamations

Revision ID: 202607180001
Revises: 202607080001
Create Date: 2026-07-18
"""

from alembic import op
import sqlalchemy as sa


revision = "202607180001"
down_revision = "202607080001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("reclamations", sa.Column("recipient", sa.String(length=80), nullable=True))


def downgrade() -> None:
    op.drop_column("reclamations", "recipient")
