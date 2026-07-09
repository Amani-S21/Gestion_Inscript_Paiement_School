from decimal import Decimal

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import relationship

from app.database.session import Base


class FeeType(Base):
    __tablename__ = "fee_types"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(120), unique=True, nullable=False)
    description = Column(String(255), nullable=True)

    fees = relationship("Fee", back_populates="fee_type")


class Fee(Base):
    __tablename__ = "fees"

    id = Column(Integer, primary_key=True, index=True)
    fee_type_id = Column(Integer, ForeignKey("fee_types.id", ondelete="RESTRICT"), nullable=False)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False)
    class_id = Column(Integer, ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=True)
    montant = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    devise = Column(String(10), default="USD", nullable=False)
    statut = Column(String(30), default="actif", nullable=False)

    fee_type = relationship("FeeType", back_populates="fees")
    academic_year = relationship("AcademicYear", back_populates="fees")
    payments = relationship("Payment", back_populates="fee")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    fee_id = Column(Integer, ForeignKey("fees.id", ondelete="RESTRICT"), nullable=False)
    montant = Column(Numeric(12, 2), nullable=False)
    devise = Column(String(10), default="USD", nullable=False)
    statut = Column(String(40), default="valide", nullable=False)
    reference = Column(String(120), unique=True, nullable=False, index=True)
    date_paiement = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    student = relationship("Student", back_populates="payments")
    fee = relationship("Fee", back_populates="payments")
    receipt = relationship("Receipt", back_populates="payment", uselist=False, cascade="all, delete-orphan")
    created_by = relationship("User", back_populates="payments_recorded")


class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String(120), unique=True, nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    payment_id = Column(Integer, ForeignKey("payments.id", ondelete="CASCADE"), nullable=False)
    qr_payload = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    student = relationship("Student", back_populates="receipts")
    payment = relationship("Payment", back_populates="receipt")

