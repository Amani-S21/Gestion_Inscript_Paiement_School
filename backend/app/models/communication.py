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

