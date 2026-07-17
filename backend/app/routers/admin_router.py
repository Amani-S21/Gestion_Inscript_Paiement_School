from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.auth.password_handler import hash_password
from app.auth.access import permission_codes
from app.auth.dependencies import get_current_user, require_permission
from app.database.session import get_db
from app.models.academic import AcademicYear, ClassRoom, Option, Section
from app.models.communication import Announcement, Notification, Reclamation
from app.models.finance import Fee, FeeType, Payment, Receipt
from app.models.registration import Registration
from app.models.student import Student
from app.models.user import Permission, Role, User
from app.permissions.codes import ROLE_ELEVE, ROLE_PERMISSION_MAP
from app.schemas.common_schema import AnnouncementIn, FeeIn, PaymentIn, RegistrationIn, StructureIn
from app.schemas.student_schema import StudentCreate, StudentUpdate
from app.services.receipt_service import render_receipt_pdf

router = APIRouter(prefix="/api", tags=["Gestion"])


def serialize_student(student: Student) -> dict:
    user = student.user
    return {
        "id": student.id,
        "matricule": student.matricule,
        "sexe": student.sexe,
        "date_naissance": student.date_naissance,
        "lieu_naissance": student.lieu_naissance,
        "nom_tuteur": student.nom_tuteur,
        "telephone_tuteur": student.telephone_tuteur,
        "user": {
            "id": user.id,
            "nom": user.nom,
            "postnom": user.postnom,
            "prenom": user.prenom,
            "email": user.email,
            "login": user.login,
            "telephone": user.telephone,
            "adresse": user.adresse,
            "photo_url": user.photo_url,
            "statut": user.statut,
        },
    }


def serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "nom": user.nom,
        "postnom": user.postnom,
        "prenom": user.prenom,
        "email": user.email,
        "login": user.login,
        "telephone": user.telephone,
        "statut": user.statut,
        "type_utilisateur": user.type_utilisateur,
        "roles": [{"id": role.id, "code": role.code, "nom": role.nom} for role in user.roles],
        "permissions": sorted({permission.code for role in user.roles for permission in role.permissions}),
    }


def serialize_role(role: Role) -> dict:
    return {
        "id": role.id,
        "code": role.code,
        "nom": role.nom,
        "description": role.description,
        "permissions": sorted(permission.code for permission in role.permissions),
    }


def full_student_name(student: Student | None) -> str:
    if not student or not student.user:
        return "Élève non renseigné"
    names = [student.user.nom, student.user.postnom, student.user.prenom]
    return " ".join(name for name in names if name) or student.matricule


def serialize_payment(payment: Payment) -> dict:
    return {
        "id": payment.id,
        "student_id": payment.student_id,
        "student_name": full_student_name(payment.student),
        "matricule": payment.student.matricule if payment.student else None,
        "fee_id": payment.fee_id,
        "fee_type": payment.fee.fee_type.nom if payment.fee and payment.fee.fee_type else "Frais scolaire",
        "montant": payment.montant,
        "devise": payment.devise,
        "statut": payment.statut,
        "reference": payment.reference,
        "date_paiement": payment.date_paiement,
        "receipt": {
            "id": payment.receipt.id,
            "numero": payment.receipt.numero,
            "created_at": payment.receipt.created_at,
        }
        if payment.receipt
        else None,
    }


def serialize_registration(registration: Registration) -> dict:
    return {
        "id": registration.id,
        "student_id": registration.student_id,
        "student_name": full_student_name(registration.student),
        "type_inscription": registration.type_inscription,
        "statut": registration.statut,
        "date_inscription": registration.date_inscription,
        "classe": registration.classroom.nom if registration.classroom else None,
        "annee_scolaire": registration.academic_year.libelle if registration.academic_year else None,
    }


def serialize_year(year: AcademicYear) -> dict:
    return {
        "id": year.id,
        "libelle": year.libelle,
        "date_debut": year.date_debut,
        "date_fin": year.date_fin,
        "active": year.active,
    }


def serialize_section(section: Section) -> dict:
    return {"id": section.id, "nom": section.nom, "description": section.description}


def serialize_option(option: Option) -> dict:
    return {"id": option.id, "nom": option.nom, "section_id": option.section_id}


def serialize_classroom(classroom: ClassRoom) -> dict:
    return {
        "id": classroom.id,
        "nom": classroom.nom,
        "niveau": classroom.niveau,
        "option_id": classroom.option_id,
        "option": classroom.option.nom if classroom.option else None,
        "section_id": classroom.option.section_id if classroom.option else None,
        "section": classroom.option.section.nom if classroom.option and classroom.option.section else None,
    }


def serialize_fee(fee: Fee) -> dict:
    return {
        "id": fee.id,
        "fee_type_id": fee.fee_type_id,
        "fee_type": fee.fee_type.nom if fee.fee_type else "Frais scolaire",
        "academic_year_id": fee.academic_year_id,
        "class_id": fee.class_id,
        "montant": fee.montant,
        "devise": fee.devise,
        "statut": fee.statut,
    }


def serialize_reclamation(item: Reclamation) -> dict:
    return {
        "id": item.id,
        "student_id": item.student_id,
        "student_name": full_student_name(item.student),
        "payment_id": item.payment_id,
        "payment_reference": item.payment.reference if item.payment else None,
        "payment_amount": item.payment.montant if item.payment else None,
        "payment_currency": item.payment.devise if item.payment else None,
        "subject": item.subject,
        "message": item.message,
        "status": item.status,
        "response": item.response,
        "created_at": item.created_at,
        "resolved_at": item.resolved_at,
    }


@router.get("/dashboard", dependencies=[Depends(require_permission("dashboard.view"))])
def dashboard(db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    payments = (
        db.query(Payment)
        .options(
            joinedload(Payment.student).joinedload(Student.user),
            joinedload(Payment.fee).joinedload(Fee.fee_type),
            joinedload(Payment.receipt),
        )
        .order_by(Payment.date_paiement.desc())
        .all()
    )
    registrations = (
        db.query(Registration)
        .options(
            joinedload(Registration.student).joinedload(Student.user),
            joinedload(Registration.classroom),
            joinedload(Registration.academic_year),
        )
        .order_by(Registration.id.desc())
        .all()
    )

    monthly_revenue: list[dict] = []
    for offset in range(5, -1, -1):
        month = today.month - offset
        year = today.year
        while month <= 0:
            month += 12
            year -= 1
        amount = sum(
            Decimal(payment.montant or 0)
            for payment in payments
            if payment.date_paiement and payment.date_paiement.month == month and payment.date_paiement.year == year
        )
        monthly_revenue.append({"label": f"{month:02d}/{year}", "montant": amount})

    daily_revenue: list[dict] = []
    for offset in range(6, -1, -1):
        day = today.fromordinal(today.toordinal() - offset)
        amount = sum(
            Decimal(payment.montant or 0)
            for payment in payments
            if payment.date_paiement and payment.date_paiement.date() == day
        )
        daily_revenue.append({"label": day.strftime("%d/%m"), "montant": amount})

    registrations_by_type = [
        {"label": "Nouvelles", "value": sum(1 for item in registrations if item.type_inscription == "nouvelle")},
        {"label": "Réinscriptions", "value": sum(1 for item in registrations if item.type_inscription == "reinscription")},
    ]
    payments_by_fee: dict[str, Decimal] = {}
    payments_by_status: dict[str, int] = {}
    for payment in payments:
        label = payment.fee.fee_type.nom if payment.fee and payment.fee.fee_type else "Frais scolaire"
        payments_by_fee[label] = payments_by_fee.get(label, Decimal("0")) + Decimal(payment.montant or 0)
        payments_by_status[payment.statut] = payments_by_status.get(payment.statut, 0) + 1

    users_by_role: dict[str, int] = {}
    for role in db.query(Role).options(joinedload(Role.users)).order_by(Role.nom.asc()).all():
        users_by_role[role.nom] = len(role.users)

    total_students = db.query(Student).count()
    active_students = db.query(Student).join(User).filter(User.statut == "actif").count()
    users_active = db.query(User).filter(User.statut == "actif").count()
    users_inactive = db.query(User).filter(User.statut != "actif").count()
    sections_count = db.query(Section).count()
    options_count = db.query(Option).count()
    classes_count = db.query(ClassRoom).count()
    years_count = db.query(AcademicYear).count()
    active_year = db.query(AcademicYear).filter(AcademicYear.active.is_(True)).first()

    return {
        "total_eleves": total_students,
        "eleves_actifs": active_students,
        "eleves_inactifs": max(total_students - active_students, 0),
        "nouvelles_inscriptions": db.query(Registration).filter(Registration.type_inscription == "nouvelle").count(),
        "reinscriptions": db.query(Registration).filter(Registration.type_inscription == "reinscription").count(),
        "recettes_du_jour": db.query(func.coalesce(func.sum(Payment.montant), 0)).filter(func.date(Payment.date_paiement) == today).scalar(),
        "recettes_mensuelles": db.query(func.coalesce(func.sum(Payment.montant), 0)).filter(func.extract("month", Payment.date_paiement) == today.month).scalar(),
        "recettes_annuelles": db.query(func.coalesce(func.sum(Payment.montant), 0)).filter(func.extract("year", Payment.date_paiement) == today.year).scalar(),
        "total_paiements": len(payments),
        "recus_generes": db.query(Receipt).count(),
        "reclamations_ouvertes": db.query(Reclamation).filter(Reclamation.status != "resolved").count(),
        "total_frais_configures": db.query(func.coalesce(func.sum(Fee.montant), 0)).scalar(),
        "utilisateurs_actifs": users_active,
        "utilisateurs_inactifs": users_inactive,
        "sections_count": sections_count,
        "options_count": options_count,
        "classes_count": classes_count,
        "annees_count": years_count,
        "annee_active": active_year.libelle if active_year else None,
        "paiements_recents": [serialize_payment(payment) for payment in payments[:8]],
        "inscriptions_recentes": [serialize_registration(registration) for registration in registrations[:8]],
        "recettes_mensuelles_chart": monthly_revenue,
        "recettes_journalieres_chart": daily_revenue,
        "inscriptions_chart": registrations_by_type,
        "frais_chart": [{"label": key, "montant": value} for key, value in payments_by_fee.items()],
        "paiements_statut_chart": [{"label": key, "value": value} for key, value in payments_by_status.items()],
        "utilisateurs_chart": [{"label": "Actifs", "value": users_active}, {"label": "Inactifs", "value": users_inactive}],
        "roles_chart": [{"label": key, "value": value} for key, value in users_by_role.items()],
        "structure_chart": [
            {"label": "Sections", "value": sections_count},
            {"label": "Options", "value": options_count},
            {"label": "Classes", "value": classes_count},
            {"label": "Années", "value": years_count},
        ],
        "notifications": db.query(Announcement).filter(Announcement.statut == "publie").order_by(Announcement.created_at.desc()).limit(5).all(),
    }

@router.get("/users", dependencies=[Depends(require_permission("admin.users"))])
def list_users(q: str | None = None, page: int = 1, size: int = 20, db: Session = Depends(get_db)):
    query = db.query(User).options(joinedload(User.roles).joinedload(Role.permissions))
    if q:
        like = f"%{q}%"
        query = query.filter(
            (User.nom.ilike(like))
            | (User.prenom.ilike(like))
            | (User.email.ilike(like))
            | (User.login.ilike(like))
        )
    total = query.count()
    users = query.order_by(User.id.desc()).offset((page - 1) * size).limit(size).all()
    return {"items": [serialize_user(user) for user in users], "total": total, "page": page, "size": size}


@router.post("/users", dependencies=[Depends(require_permission("admin.users"))])
def create_user(payload: dict, db: Session = Depends(get_db)):
    role_code = payload.get("role_code") or payload.get("type_utilisateur")
    if role_code not in ROLE_PERMISSION_MAP:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rôle invalide.")
    if db.query(User).filter((User.login == payload.get("login")) | (User.email == payload.get("email"))).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Login ou email déjà utilisé.")

    role = db.query(Role).filter(Role.code == role_code).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rôle introuvable.")
    user = User(
        nom=payload.get("nom") or "Utilisateur",
        postnom=payload.get("postnom"),
        prenom=payload.get("prenom"),
        email=payload.get("email"),
        login=payload.get("login"),
        telephone=payload.get("telephone"),
        adresse=payload.get("adresse"),
        mot_de_passe=hash_password(payload.get("password") or "Passer@123"),
        statut=payload.get("statut") or "actif",
        type_utilisateur=role_code,
    )
    user.roles.append(role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return serialize_user(user)


@router.patch("/users/{user_id}/status", dependencies=[Depends(require_permission("admin.users"))])
def update_user_status(user_id: int, payload: dict, current_user: User = Depends(require_permission("admin.users")), db: Session = Depends(get_db)):
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Impossible de desactiver votre propre compte.")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable.")
    statut_value = payload.get("statut")
    if statut_value not in {"actif", "inactif"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Statut invalide.")
    user.statut = statut_value
    db.commit()
    db.refresh(user)
    return serialize_user(user)


@router.get("/roles", dependencies=[Depends(require_permission("admin.roles"))])
def list_roles(db: Session = Depends(get_db)):
    roles = db.query(Role).options(joinedload(Role.permissions)).order_by(Role.nom.asc()).all()
    return [serialize_role(role) for role in roles]


@router.get("/permissions", dependencies=[Depends(require_permission("admin.roles"))])
def list_permissions(db: Session = Depends(get_db)):
    permissions = db.query(Permission).order_by(Permission.code.asc()).all()
    return [{"id": permission.id, "code": permission.code, "description": permission.description} for permission in permissions]


@router.get("/students", dependencies=[Depends(require_permission("students.view"))])
def list_students(q: str | None = None, page: int = 1, size: int = 20, db: Session = Depends(get_db)):
    query = db.query(Student).join(User)
    if q:
        like = f"%{q}%"
        query = query.filter((User.nom.ilike(like)) | (User.prenom.ilike(like)) | (Student.matricule.ilike(like)))
    total = query.count()
    items = query.order_by(Student.id.desc()).offset((page - 1) * size).limit(size).all()
    return {"items": [serialize_student(item) for item in items], "total": total, "page": page, "size": size}


@router.post("/students", dependencies=[Depends(require_permission("students.manage"))])
def create_student(payload: StudentCreate, db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.code == ROLE_ELEVE).first()
    if not role:
        raise HTTPException(status_code=500, detail="Rôle élève non initialisé.")
    user = User(
        nom=payload.nom,
        postnom=payload.postnom,
        prenom=payload.prenom,
        email=payload.email,
        login=payload.login,
        telephone=payload.telephone,
        adresse=payload.adresse,
        mot_de_passe=hash_password(payload.password or f"{payload.matricule}@123"),
        statut="actif",
        type_utilisateur=ROLE_ELEVE,
    )
    user.roles.append(role)
    student = Student(
        matricule=payload.matricule,
        sexe=payload.sexe,
        date_naissance=payload.date_naissance,
        lieu_naissance=payload.lieu_naissance,
        nom_tuteur=payload.nom_tuteur,
        telephone_tuteur=payload.telephone_tuteur,
        user=user,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return serialize_student(student)


@router.patch("/students/{student_id}", dependencies=[Depends(require_permission("students.manage"))])
def update_student(student_id: int, payload: StudentUpdate, db: Session = Depends(get_db)):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Élève introuvable.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        if key == "password" and value:
            student.user.mot_de_passe = hash_password(value)
        elif hasattr(student, key):
            setattr(student, key, value)
        elif hasattr(student.user, key):
            setattr(student.user, key, value)
    db.commit()
    db.refresh(student)
    return serialize_student(student)


@router.patch("/students/{student_id}/status", dependencies=[Depends(require_permission("students.manage"))])
def update_student_status(student_id: int, payload: dict, db: Session = Depends(get_db)):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Élève introuvable.")
    statut_value = payload.get("statut")
    if statut_value not in {"actif", "inactif"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Statut invalide.")
    student.user.statut = statut_value
    db.commit()
    db.refresh(student)
    return serialize_student(student)


@router.delete("/students/{student_id}", dependencies=[Depends(require_permission("students.manage"))])
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Élève introuvable.")
    user = student.user
    db.delete(student)
    if user:
        db.delete(user)
    db.commit()
    return {"message": "Élève supprimé."}


@router.post("/registrations", dependencies=[Depends(require_permission("registrations.manage"))])
def create_registration(payload: RegistrationIn, db: Session = Depends(get_db)):
    registration = Registration(**payload.model_dump(), statut="validee")
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration


@router.get("/registrations", dependencies=[Depends(require_permission("registrations.view"))])
def list_registrations(page: int = 1, size: int = 20, db: Session = Depends(get_db)):
    query = (
        db.query(Registration)
        .options(
            joinedload(Registration.student).joinedload(Student.user),
            joinedload(Registration.classroom),
            joinedload(Registration.academic_year),
        )
        .order_by(Registration.id.desc())
    )
    return {"items": [serialize_registration(item) for item in query.offset((page - 1) * size).limit(size).all()], "total": query.count(), "page": page, "size": size}


@router.post("/payments", dependencies=[Depends(require_permission("payments.manage"))])
def create_payment(payload: PaymentIn, current_user: User = Depends(require_permission("payments.manage")), db: Session = Depends(get_db)):
    payment = Payment(
        **payload.model_dump(),
        statut="valide",
        reference=f"PAY-{datetime.utcnow():%Y%m%d}-{uuid4().hex[:8].upper()}",
        created_by_id=current_user.id,
    )
    db.add(payment)
    db.flush()
    receipt = Receipt(
        numero=f"REC-{datetime.utcnow():%Y%m%d}-{payment.id:06d}",
        student_id=payment.student_id,
        payment_id=payment.id,
        qr_payload=f"RECEIPT:{payment.reference}:{payment.student_id}:{payment.montant}",
    )
    db.add(receipt)
    db.add(
        Notification(
            student_id=payment.student_id,
            titre="Paiement enregistré",
            message=f"Votre paiement de {payment.montant} {payment.devise} a été enregistré. Le reçu {receipt.numero} est disponible.",
        )
    )
    db.commit()
    db.refresh(payment)
    payment = (
        db.query(Payment)
        .options(
            joinedload(Payment.student).joinedload(Student.user),
            joinedload(Payment.fee).joinedload(Fee.fee_type),
            joinedload(Payment.receipt),
        )
        .filter(Payment.id == payment.id)
        .first()
    )
    return serialize_payment(payment)


@router.get("/payments", dependencies=[Depends(require_permission("payments.view"))])
def list_payments(page: int = 1, size: int = 20, db: Session = Depends(get_db)):
    query = (
        db.query(Payment)
        .options(
            joinedload(Payment.student).joinedload(Student.user),
            joinedload(Payment.fee).joinedload(Fee.fee_type),
            joinedload(Payment.receipt),
        )
        .order_by(Payment.date_paiement.desc())
    )
    return {"items": [serialize_payment(item) for item in query.offset((page - 1) * size).limit(size).all()], "total": query.count(), "page": page, "size": size}


@router.get("/payments/{payment_id}/receipt/pdf", dependencies=[Depends(require_permission("receipts.print"))])
def payment_receipt_pdf(payment_id: int, db: Session = Depends(get_db)):
    receipt = (
        db.query(Receipt)
        .options(joinedload(Receipt.payment), joinedload(Receipt.student).joinedload(Student.user))
        .filter(Receipt.payment_id == payment_id)
        .first()
    )
    if not receipt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reçu introuvable.")
    return Response(
        content=render_receipt_pdf(receipt),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="recu-{receipt.numero}.pdf"'},
    )


@router.get("/reclamations", dependencies=[Depends(require_permission("reclamations.view"))])
def list_reclamations(page: int = 1, size: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = (
        db.query(Reclamation)
        .options(joinedload(Reclamation.student).joinedload(Student.user), joinedload(Reclamation.payment))
        .order_by(Reclamation.created_at.desc())
    )
    if current_user.student and "reclamations.manage" not in permission_codes(current_user):
        query = query.filter(Reclamation.student_id == current_user.student.id)
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return {"items": [serialize_reclamation(item) for item in items], "total": total, "page": page, "size": size}


@router.post("/reclamations", dependencies=[Depends(require_permission("reclamations.create"))])
def create_reclamation(payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.student:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Seul un élève peut créer une réclamation.")
    payment_id = payload.get("payment_id")
    if payment_id:
        payment = db.get(Payment, int(payment_id))
        if not payment or payment.student_id != current_user.student.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Paiement invalide pour cette réclamation.")
    item = Reclamation(
        student_id=current_user.student.id,
        payment_id=int(payment_id) if payment_id else None,
        subject=payload.get("subject") or "Réclamation",
        message=payload.get("message") or "",
        status="open",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return serialize_reclamation(item)


@router.patch("/reclamations/{reclamation_id}", dependencies=[Depends(require_permission("reclamations.manage"))])
def update_reclamation(reclamation_id: int, payload: dict, db: Session = Depends(get_db)):
    item = db.get(Reclamation, reclamation_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Réclamation introuvable.")
    item.status = payload.get("status") or item.status
    item.response = payload.get("response") or item.response
    if item.status in {"resolved", "resolue", "résolue"}:
        item.status = "resolved"
        item.resolved_at = datetime.utcnow()
    db.add(
        Notification(
            student_id=item.student_id,
            titre="Réclamation mise à jour",
            message=f"Votre réclamation '{item.subject}' est maintenant: {item.status}.",
        )
    )
    db.commit()
    db.refresh(item)
    return serialize_reclamation(item)


@router.get("/reports/overview", dependencies=[Depends(require_permission("reports.view"))])
def reports_overview(db: Session = Depends(get_db)):
    payments = (
        db.query(Payment)
        .options(joinedload(Payment.fee).joinedload(Fee.fee_type), joinedload(Payment.student).joinedload(Student.user))
        .order_by(Payment.date_paiement.desc())
        .all()
    )
    registrations_count = db.query(Registration).count()
    total_paid = sum(Decimal(payment.montant or 0) for payment in payments)
    by_fee: dict[str, Decimal] = {}
    by_status: dict[str, int] = {}
    for payment in payments:
        fee_label = payment.fee.fee_type.nom if payment.fee and payment.fee.fee_type else "Frais scolaire"
        by_fee[fee_label] = by_fee.get(fee_label, Decimal("0")) + Decimal(payment.montant or 0)
        by_status[payment.statut] = by_status.get(payment.statut, 0) + 1
    return {
        "cards": [
            {"label": "Paiements enregistrés", "value": len(payments)},
            {"label": "Montant encaissé", "value": total_paid},
            {"label": "Inscriptions", "value": registrations_count},
            {"label": "Reçus générés", "value": db.query(Receipt).count()},
        ],
        "by_fee": [{"label": label, "montant": amount} for label, amount in by_fee.items()],
        "by_status": [{"label": label, "value": value} for label, value in by_status.items()],
        "recent_payments": [serialize_payment(payment) for payment in payments[:10]],
    }


@router.post("/announcements", dependencies=[Depends(require_permission("announcements.manage"))])
def create_announcement(payload: AnnouncementIn, db: Session = Depends(get_db)):
    item = Announcement(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/announcements", dependencies=[Depends(require_permission("announcements.view"))])
def list_announcements(db: Session = Depends(get_db)):
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()


@router.get("/academic-years", dependencies=[Depends(require_permission("registrations.view"))])
def list_academic_years(db: Session = Depends(get_db)):
    years = db.query(AcademicYear).order_by(AcademicYear.active.desc(), AcademicYear.id.desc()).all()
    return [serialize_year(year) for year in years]


@router.post("/academic-years", dependencies=[Depends(require_permission("admin.settings"))])
def create_year(payload: dict, db: Session = Depends(get_db)):
    if payload.get("active"):
        db.query(AcademicYear).filter(AcademicYear.active.is_(True)).update({"active": False})
    item = AcademicYear(**payload)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/academic-years/{year_id}/close", dependencies=[Depends(require_permission("admin.settings"))])
def close_academic_year(year_id: int, db: Session = Depends(get_db)):
    item = db.get(AcademicYear, year_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Année scolaire introuvable.")
    item.active = False
    db.commit()
    db.refresh(item)
    return serialize_year(item)


@router.get("/sections", dependencies=[Depends(require_permission("registrations.view"))])
def list_sections(db: Session = Depends(get_db)):
    return [serialize_section(section) for section in db.query(Section).order_by(Section.nom.asc()).all()]


@router.post("/sections", dependencies=[Depends(require_permission("admin.settings"))])
def create_section(payload: StructureIn, db: Session = Depends(get_db)):
    item = Section(nom=payload.nom, description=payload.description)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/options", dependencies=[Depends(require_permission("registrations.view"))])
def list_options(db: Session = Depends(get_db)):
    return [serialize_option(option) for option in db.query(Option).order_by(Option.nom.asc()).all()]


@router.post("/options", dependencies=[Depends(require_permission("admin.settings"))])
def create_option(payload: StructureIn, db: Session = Depends(get_db)):
    item = Option(nom=payload.nom, section_id=payload.section_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/classes", dependencies=[Depends(require_permission("registrations.view"))])
def list_classes(db: Session = Depends(get_db)):
    classrooms = db.query(ClassRoom).options(joinedload(ClassRoom.option).joinedload(Option.section)).order_by(ClassRoom.nom.asc()).all()
    return [serialize_classroom(classroom) for classroom in classrooms]


@router.post("/classes", dependencies=[Depends(require_permission("admin.settings"))])
def create_class(payload: StructureIn, db: Session = Depends(get_db)):
    item = ClassRoom(nom=payload.nom, niveau=payload.niveau, option_id=payload.option_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/fees", dependencies=[Depends(require_permission("payments.view"))])
def list_fees(db: Session = Depends(get_db)):
    fees = db.query(Fee).options(joinedload(Fee.fee_type)).order_by(Fee.id.desc()).all()
    return [serialize_fee(fee) for fee in fees]


@router.get("/fee-types", dependencies=[Depends(require_permission("admin.settings"))])
def list_fee_types(db: Session = Depends(get_db)):
    return [{"id": item.id, "nom": item.nom, "description": item.description} for item in db.query(FeeType).order_by(FeeType.nom.asc()).all()]


@router.post("/fee-types", dependencies=[Depends(require_permission("admin.settings"))])
def create_fee_type(payload: StructureIn, db: Session = Depends(get_db)):
    existing = db.query(FeeType).filter(FeeType.nom == payload.nom).first()
    if existing:
        return existing
    item = FeeType(nom=payload.nom, description=payload.description)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/fees", dependencies=[Depends(require_permission("admin.settings"))])
def create_fee(payload: FeeIn, db: Session = Depends(get_db)):
    item = Fee(**payload.model_dump(), statut="actif")
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
