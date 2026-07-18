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
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()
    if "reclamations" not in tables:
        op.create_table(
            "reclamations",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id", ondelete="CASCADE"), nullable=False),
            sa.Column("payment_id", sa.Integer(), sa.ForeignKey("payments.id", ondelete="SET NULL"), nullable=True),
            sa.Column("recipient", sa.String(length=80), nullable=True),
            sa.Column("subject", sa.String(length=180), nullable=False),
            sa.Column("message", sa.Text(), nullable=False),
            sa.Column("status", sa.String(length=40), nullable=False, server_default="open"),
            sa.Column("response", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        )
        return
    columns = {column["name"] for column in inspector.get_columns("reclamations")}
    if "recipient" not in columns:
        op.add_column("reclamations", sa.Column("recipient", sa.String(length=80), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "reclamations" in inspector.get_table_names():
        columns = {column["name"] for column in inspector.get_columns("reclamations")}
        if "recipient" in columns:
            op.drop_column("reclamations", "recipient")
