from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database.session import Base


class AcademicYear(Base):
    __tablename__ = "academic_years"

    id = Column(Integer, primary_key=True, index=True)
    libelle = Column(String(40), unique=True, nullable=False)
    date_debut = Column(Date, nullable=True)
    date_fin = Column(Date, nullable=True)
    active = Column(Boolean, default=False, nullable=False)

    fees = relationship("Fee", back_populates="academic_year")
    registrations = relationship("Registration", back_populates="academic_year")


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(120), unique=True, nullable=False)
    description = Column(String(255), nullable=True)

    options = relationship("Option", back_populates="section")


class Option(Base):
    __tablename__ = "options"
    __table_args__ = (UniqueConstraint("nom", "section_id", name="uq_option_section"),)

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(120), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="CASCADE"), nullable=False)

    section = relationship("Section", back_populates="options")
    classes = relationship("ClassRoom", back_populates="option")


class ClassRoom(Base):
    __tablename__ = "classrooms"
    __table_args__ = (UniqueConstraint("nom", "option_id", name="uq_class_option"),)

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(120), nullable=False)
    niveau = Column(String(80), nullable=True)
    option_id = Column(Integer, ForeignKey("options.id", ondelete="CASCADE"), nullable=False)

    option = relationship("Option", back_populates="classes")
    registrations = relationship("Registration", back_populates="classroom")

