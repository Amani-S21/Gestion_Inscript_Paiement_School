from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.database.session import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    titre = Column(String(160), nullable=False)
    message = Column(Text, nullable=False)
    lu = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    student = relationship("Student", back_populates="notifications")


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(180), nullable=False)
    contenu = Column(Text, nullable=False)
    statut = Column(String(40), default="publie", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class MarketingMedia(Base):
    __tablename__ = "marketing_media"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(180), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=False)
    statut = Column(String(40), default="publie", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Reclamation(Base):
    __tablename__ = "reclamations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    payment_id = Column(Integer, ForeignKey("payments.id", ondelete="SET NULL"), nullable=True)
    recipient = Column(String(80), nullable=True)
    subject = Column(String(180), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(40), default="open", nullable=False)
    response = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    student = relationship("Student")
    payment = relationship("Payment")

