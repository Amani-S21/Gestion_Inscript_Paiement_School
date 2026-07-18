from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session, joinedload

from app.auth.access import is_student
from app.auth.dependencies import get_current_user, require_permission
from app.database.session import get_db
from app.models.academic import AcademicYear, ClassRoom
from app.models.communication import Announcement, Notification
from app.models.finance import Fee, Payment, Receipt
from app.models.registration import Registration
from app.models.student import Student
from app.models.user import User
from app.schemas.student_schema import StudentDashboard, StudentProfile, StudentUpdate
from app.services.receipt_service import render_receipt_pdf, render_student_card_pdf
from app.services.student_service import build_student_dashboard, full_name, profile_from_student

router = APIRouter(prefix="/student/me", tags=["Espace eleve"])


def current_student(current_user: User = Depends(get_current_user)) -> Student:
    if not is_student(current_user) or not current_user.student:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acces reserve aux eleves.")
    return current_user.student


@router.get("/dashboard", response_model=StudentDashboard)
def dashboard(student: Student = Depends(current_student), db: Session = Depends(get_db)):
    return build_student_dashboard(db, student)


@router.get("/profile", response_model=StudentProfile)
def profile(student: Student = Depends(current_student)):
    return profile_from_student(student)


@router.patch("/profile", response_model=StudentProfile)
def update_profile(payload: StudentUpdate, student: Student = Depends(current_student), db: Session = Depends(get_db)):
    allowed = payload.model_dump(exclude_unset=True)
    for key, value in allowed.items():
        if hasattr(student.user, key):
            setattr(student.user, key, value)
    db.commit()
    db.refresh(student)
    return profile_from_student(student)


@router.get("/registration")
def registration(student: Student = Depends(current_student), db: Session = Depends(get_db)):
    item = (
        db.query(Registration)
        .options(joinedload(Registration.academic_year), joinedload(Registration.classroom).joinedload(ClassRoom.option))
        .filter(Registration.student_id == student.id)
        .order_by(Registration.id.desc())
        .first()
    )
    if not item:
        return None
    return {
        "id": item.id,
        "statut": item.statut,
        "type_inscription": item.type_inscription,
        "annee_scolaire": item.academic_year.libelle,
        "classe": item.classroom.nom,
        "option": item.classroom.option.nom,
        "date_inscription": item.date_inscription,
    }


@router.get("/payments")
def payments(student: Student = Depends(current_student), db: Session = Depends(get_db)):
    items = db.query(Payment).filter(Payment.student_id == student.id).order_by(Payment.date_paiement.desc()).all()
    return items


@router.get("/fees")
def fees(student: Student = Depends(current_student), db: Session = Depends(get_db)):
    reg = (
        db.query(Registration)
        .join(AcademicYear)
        .filter(Registration.student_id == student.id)
        .order_by(AcademicYear.active.desc(), Registration.id.desc())
        .first()
    )
    if not reg:
        return []
    return (
        db.query(Fee)
        .filter(
            Fee.academic_year_id == reg.academic_year_id,
            (Fee.class_id == reg.classroom_id) | (Fee.class_id.is_(None)),
            Fee.statut == "actif",
        )
        .all()
    )


@router.get("/receipts/{receipt_id}/pdf")
def receipt_pdf(
    receipt_id: int,
    student: Student = Depends(current_student),
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("student.receipts.download")),
):
    receipt = (
        db.query(Receipt)
        .options(joinedload(Receipt.payment), joinedload(Receipt.student).joinedload(Student.user))
        .filter(Receipt.id == receipt_id, Receipt.student_id == student.id)
        .first()
    )
    if not receipt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recu introuvable.")
    return Response(
        content=render_receipt_pdf(receipt),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="recu-{receipt.numero}.pdf"'},
    )


@router.get("/card/pdf")
def student_card(student: Student = Depends(current_student), db: Session = Depends(get_db)):
    reg = db.query(Registration).options(joinedload(Registration.classroom)).filter(Registration.student_id == student.id).order_by(Registration.id.desc()).first()
    payload = f"STUDENT:{student.id}:{student.matricule}"
    pdf = render_student_card_pdf(payload, full_name(student.user), student.matricule, reg.classroom.nom if reg else None, student.user.photo_url)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="carte-{student.matricule}.pdf"'},
    )


@router.get("/notifications")
def notifications(student: Student = Depends(current_student), db: Session = Depends(get_db)):
    return db.query(Notification).filter(Notification.student_id == student.id).order_by(Notification.created_at.desc()).all()


@router.get("/announcements")
def announcements(_: User = Depends(require_permission("announcements.view")), db: Session = Depends(get_db)):
    return db.query(Announcement).filter(Announcement.statut == "publie").order_by(Announcement.created_at.desc()).all()

