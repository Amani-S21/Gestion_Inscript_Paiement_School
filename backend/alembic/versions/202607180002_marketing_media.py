"""add marketing media

Revision ID: 202607180002
Revises: 202607180001
Create Date: 2026-07-18
"""

from alembic import op
import sqlalchemy as sa


revision = "202607180002"
down_revision = "202607180001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "marketing_media" in inspector.get_table_names():
        return
    op.create_table(
        "marketing_media",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=False),
        sa.Column("statut", sa.String(length=40), nullable=False, server_default="publie"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "marketing_media" in inspector.get_table_names():
        op.drop_table("marketing_media")
