from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.academic import AcademicYear, ClassRoom, Option
from app.models.communication import Notification
from app.models.finance import Fee, Payment, Receipt
from app.models.registration import Registration
from app.models.student import Student
from app.models.user import User
from app.schemas.student_schema import StudentDashboard, StudentProfile


def full_name(user: User) -> str:
    return " ".join(part for part in [user.nom, user.postnom, user.prenom] if part)


def get_student_or_404(db: Session, student_id: int) -> Student:
    student = (
        db.query(Student)
        .options(joinedload(Student.user), joinedload(Student.registrations))
        .filter(Student.id == student_id)
        .first()
    )
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Eleve introuvable.")
    return student


def profile_from_student(student: Student) -> StudentProfile:
    user = student.user
    return StudentProfile(
        id=student.id,
        matricule=student.matricule,
        nom_complet=full_name(user),
        email=user.email,
        telephone=user.telephone,
        adresse=user.adresse,
        photo_url=user.photo_url,
        sexe=student.sexe,
        date_naissance=student.date_naissance,
        lieu_naissance=student.lieu_naissance,
        nom_tuteur=student.nom_tuteur,
        telephone_tuteur=student.telephone_tuteur,
    )


def build_student_dashboard(db: Session, student: Student) -> StudentDashboard:
    active_registration = (
        db.query(Registration)
        .join(AcademicYear)
        .options(
            joinedload(Registration.academic_year),
            joinedload(Registration.classroom).joinedload(ClassRoom.option).joinedload(Option.section),
        )
        .filter(Registration.student_id == student.id)
        .order_by(AcademicYear.active.desc(), Registration.id.desc())
        .first()
    )
    total_fees = Decimal("0.00")
    if active_registration:
        total_fees = db.query(func.coalesce(func.sum(Fee.montant), 0)).filter(
            Fee.academic_year_id == active_registration.academic_year_id,
            (Fee.class_id == active_registration.classroom_id) | (Fee.class_id.is_(None)),
            Fee.statut == "actif",
        ).scalar()

    total_paid = db.query(func.coalesce(func.sum(Payment.montant), 0)).filter(
        Payment.student_id == student.id,
        Payment.statut == "valide",
    ).scalar()
    payment_count = db.query(Payment).filter(Payment.student_id == student.id, Payment.statut == "valide").count()
    latest_payment = (
        db.query(Payment)
        .filter(Payment.student_id == student.id)
        .order_by(Payment.date_paiement.desc())
        .first()
    )
    receipts = (
        db.query(Receipt)
        .join(Payment)
        .filter(Receipt.student_id == student.id)
        .order_by(Receipt.created_at.desc())
        .limit(5)
        .all()
    )
    notifications = (
        db.query(Notification)
        .filter(Notification.student_id == student.id)
        .order_by(Notification.created_at.desc())
        .limit(5)
        .all()
    )
    balance = Decimal(total_fees) - Decimal(total_paid)
    status_label = "paye" if balance <= 0 and total_fees > 0 else "partiellement_paye" if total_paid > 0 else "impaye"

    return StudentDashboard(
        profile=profile_from_student(student),
        classe=active_registration.classroom.nom if active_registration else None,
        option=active_registration.classroom.option.nom if active_registration else None,
        annee_scolaire=active_registration.academic_year.libelle if active_registration else None,
        total_paiements=payment_count,
        montant_total_frais=total_fees,
        montant_total_paye=total_paid,
        solde_restant=max(balance, Decimal("0.00")),
        dernier_paiement=latest_payment.date_paiement if latest_payment else None,
        etat_frais=status_label,
        derniers_recus=[{"id": r.id, "numero": r.numero, "payment_id": r.payment_id} for r in receipts],
        notifications=[{"id": n.id, "titre": n.titre, "message": n.message, "lu": n.lu} for n in notifications],
    )

