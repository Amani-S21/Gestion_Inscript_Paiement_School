from sqlalchemy import Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.session import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    matricule = Column(String(80), unique=True, nullable=False, index=True)
    date_naissance = Column(Date, nullable=True)
    lieu_naissance = Column(String(120), nullable=True)
    sexe = Column(String(20), nullable=True)
    nom_tuteur = Column(String(160), nullable=True)
    telephone_tuteur = Column(String(40), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    user = relationship("User", back_populates="student")
    registrations = relationship("Registration", back_populates="student", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="student", cascade="all, delete-orphan")
    receipts = relationship("Receipt", back_populates="student", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="student", cascade="all, delete-orphan")

