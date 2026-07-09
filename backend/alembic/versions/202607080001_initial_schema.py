"""initial schema

Revision ID: 202607080001
Revises:
Create Date: 2026-07-08
"""
from alembic import op
import sqlalchemy as sa

revision = "202607080001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("permissions", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("code", sa.String(120), nullable=False), sa.Column("description", sa.String(255)))
    op.create_index("ix_permissions_code", "permissions", ["code"], unique=True)
    op.create_table("roles", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("code", sa.String(60), nullable=False), sa.Column("nom", sa.String(120), nullable=False), sa.Column("description", sa.String(255)))
    op.create_index("ix_roles_code", "roles", ["code"], unique=True)
    op.create_table("users", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("nom", sa.String(100), nullable=False), sa.Column("postnom", sa.String(100)), sa.Column("prenom", sa.String(100)), sa.Column("email", sa.String(160), nullable=False), sa.Column("login", sa.String(80), nullable=False), sa.Column("telephone", sa.String(40)), sa.Column("adresse", sa.String(255)), sa.Column("photo_url", sa.String(500)), sa.Column("mot_de_passe", sa.String(255), nullable=False), sa.Column("statut", sa.String(30), nullable=False), sa.Column("type_utilisateur", sa.String(60), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_login", "users", ["login"], unique=True)
    op.create_table("role_permissions", sa.Column("role_id", sa.Integer(), sa.ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True), sa.Column("permission_id", sa.Integer(), sa.ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True))
    op.create_table("user_roles", sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True), sa.Column("role_id", sa.Integer(), sa.ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True))
    op.create_table("academic_years", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("libelle", sa.String(40), nullable=False), sa.Column("date_debut", sa.Date()), sa.Column("date_fin", sa.Date()), sa.Column("active", sa.Boolean(), nullable=False))
    op.create_index("ix_academic_years_libelle", "academic_years", ["libelle"], unique=True)
    op.create_table("sections", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("nom", sa.String(120), nullable=False), sa.Column("description", sa.String(255)))
    op.create_index("ix_sections_nom", "sections", ["nom"], unique=True)
    op.create_table("students", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("matricule", sa.String(80), nullable=False), sa.Column("date_naissance", sa.Date()), sa.Column("lieu_naissance", sa.String(120)), sa.Column("sexe", sa.String(20)), sa.Column("nom_tuteur", sa.String(160)), sa.Column("telephone_tuteur", sa.String(40)), sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True))
    op.create_index("ix_students_matricule", "students", ["matricule"], unique=True)
    op.create_table("options", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("nom", sa.String(120), nullable=False), sa.Column("section_id", sa.Integer(), sa.ForeignKey("sections.id", ondelete="CASCADE"), nullable=False), sa.UniqueConstraint("nom", "section_id", name="uq_option_section"))
    op.create_table("classrooms", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("nom", sa.String(120), nullable=False), sa.Column("niveau", sa.String(80)), sa.Column("option_id", sa.Integer(), sa.ForeignKey("options.id", ondelete="CASCADE"), nullable=False), sa.UniqueConstraint("nom", "option_id", name="uq_class_option"))
    op.create_table("fee_types", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("nom", sa.String(120), nullable=False), sa.Column("description", sa.String(255)))
    op.create_index("ix_fee_types_nom", "fee_types", ["nom"], unique=True)
    op.create_table("announcements", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("titre", sa.String(180), nullable=False), sa.Column("contenu", sa.Text(), nullable=False), sa.Column("statut", sa.String(40), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.create_table("notifications", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id", ondelete="CASCADE"), nullable=False), sa.Column("titre", sa.String(160), nullable=False), sa.Column("message", sa.Text(), nullable=False), sa.Column("lu", sa.Boolean(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.create_table("registrations", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id", ondelete="CASCADE"), nullable=False), sa.Column("academic_year_id", sa.Integer(), sa.ForeignKey("academic_years.id", ondelete="RESTRICT"), nullable=False), sa.Column("classroom_id", sa.Integer(), sa.ForeignKey("classrooms.id", ondelete="RESTRICT"), nullable=False), sa.Column("type_inscription", sa.String(40), nullable=False), sa.Column("statut", sa.String(40), nullable=False), sa.Column("date_inscription", sa.Date()), sa.UniqueConstraint("student_id", "academic_year_id", name="uq_student_year_registration"))
    op.create_table("fees", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("fee_type_id", sa.Integer(), sa.ForeignKey("fee_types.id", ondelete="RESTRICT"), nullable=False), sa.Column("academic_year_id", sa.Integer(), sa.ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False), sa.Column("class_id", sa.Integer(), sa.ForeignKey("classrooms.id", ondelete="CASCADE")), sa.Column("montant", sa.Numeric(12, 2), nullable=False), sa.Column("devise", sa.String(10), nullable=False), sa.Column("statut", sa.String(30), nullable=False))
    op.create_table("payments", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id", ondelete="CASCADE"), nullable=False), sa.Column("fee_id", sa.Integer(), sa.ForeignKey("fees.id", ondelete="RESTRICT"), nullable=False), sa.Column("montant", sa.Numeric(12, 2), nullable=False), sa.Column("devise", sa.String(10), nullable=False), sa.Column("statut", sa.String(40), nullable=False), sa.Column("reference", sa.String(120), nullable=False), sa.Column("date_paiement", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL")))
    op.create_index("ix_payments_reference", "payments", ["reference"], unique=True)
    op.create_table("receipts", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("numero", sa.String(120), nullable=False), sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id", ondelete="CASCADE"), nullable=False), sa.Column("payment_id", sa.Integer(), sa.ForeignKey("payments.id", ondelete="CASCADE"), nullable=False), sa.Column("qr_payload", sa.String(500), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.create_index("ix_receipts_numero", "receipts", ["numero"], unique=True)
    op.create_table("activity_logs", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL")), sa.Column("action", sa.String(120), nullable=False), sa.Column("cible", sa.String(160)), sa.Column("details", sa.Text()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))


def downgrade() -> None:
    for table in ["activity_logs", "receipts", "payments", "fees", "registrations", "notifications", "announcements", "fee_types", "classrooms", "options", "students", "sections", "academic_years", "user_roles", "role_permissions", "users", "roles", "permissions"]:
        op.drop_table(table)
