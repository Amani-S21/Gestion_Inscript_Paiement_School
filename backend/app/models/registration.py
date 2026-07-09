from sqlalchemy import Column, Date, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database.session import Base


class Registration(Base):
    __tablename__ = "registrations"
    __table_args__ = (
        UniqueConstraint("student_id", "academic_year_id", name="uq_student_year_registration"),
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id", ondelete="RESTRICT"), nullable=False)
    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="RESTRICT"), nullable=False)
    type_inscription = Column(String(40), default="nouvelle", nullable=False)
    statut = Column(String(40), default="validee", nullable=False)
    date_inscription = Column(Date, nullable=True)

    student = relationship("Student", back_populates="registrations")
    academic_year = relationship("AcademicYear", back_populates="registrations")
    classroom = relationship("ClassRoom", back_populates="registrations")

