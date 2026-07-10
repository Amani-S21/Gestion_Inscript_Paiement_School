from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.auth.password_handler import hash_password
from app.auth.dependencies import require_permission
from app.database.session import get_db
from app.models.academic import AcademicYear, ClassRoom, Option, Section
from app.models.communication import Announcement
from app.models.finance import Fee, FeeType, Payment, Receipt
from app.models.registration import Registration
from app.models.student import Student
from app.models.user import Permission, Role, User
from app.permissions.codes import ROLE_ELEVE, ROLE_PERMISSION_MAP
from app.schemas.common_schema import AnnouncementIn, FeeIn, PaymentIn, RegistrationIn, StructureIn
from app.schemas.student_schema import StudentCreate, StudentUpdate

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


@router.get("/dashboard", dependencies=[Depends(require_permission("dashboard.view"))])
def dashboard(db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    return {
        "total_eleves": db.query(Student).count(),
        "nouvelles_inscriptions": db.query(Registration).filter(Registration.type_inscription == "nouvelle").count(),
        "reinscriptions": db.query(Registration).filter(Registration.type_inscription == "reinscription").count(),
        "recettes_du_jour": db.query(func.coalesce(func.sum(Payment.montant), 0)).filter(func.date(Payment.date_paiement) == today).scalar(),
        "recettes_mensuelles": db.query(func.coalesce(func.sum(Payment.montant), 0)).filter(func.extract("month", Payment.date_paiement) == today.month).scalar(),
        "recettes_annuelles": db.query(func.coalesce(func.sum(Payment.montant), 0)).filter(func.extract("year", Payment.date_paiement) == today.year).scalar(),
        "paiements_recents": db.query(Payment).order_by(Payment.date_paiement.desc()).limit(8).all(),
        "inscriptions_recentes": db.query(Registration).order_by(Registration.id.desc()).limit(8).all(),
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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role invalide.")
    if db.query(User).filter((User.login == payload.get("login")) | (User.email == payload.get("email"))).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Login ou email deja utilise.")

    role = db.query(Role).filter(Role.code == role_code).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role introuvable.")
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
        raise HTTPException(status_code=500, detail="Role eleve non initialise.")
    user = User(
        nom=payload.nom,
        postnom=payload.postnom,
        prenom=payload.prenom,
        email=payload.email,
        login=payload.login,
        telephone=payload.telephone,
        adresse=payload.adresse,
        mot_de_passe=hash_password(f"{payload.matricule}@123"),
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
        raise HTTPException(status_code=404, detail="Eleve introuvable.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        if hasattr(student.user, key):
            setattr(student.user, key, value)
    db.commit()
    db.refresh(student)
    return serialize_student(student)


@router.post("/registrations", dependencies=[Depends(require_permission("registrations.manage"))])
def create_registration(payload: RegistrationIn, db: Session = Depends(get_db)):
    registration = Registration(**payload.model_dump(), statut="validee")
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration


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
    db.commit()
    db.refresh(payment)
    return payment


@router.get("/payments", dependencies=[Depends(require_permission("payments.view"))])
def list_payments(page: int = 1, size: int = 20, db: Session = Depends(get_db)):
    query = db.query(Payment).order_by(Payment.date_paiement.desc())
    return {"items": query.offset((page - 1) * size).limit(size).all(), "total": query.count(), "page": page, "size": size}


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


@router.post("/academic-years", dependencies=[Depends(require_permission("admin.settings"))])
def create_year(payload: dict, db: Session = Depends(get_db)):
    item = AcademicYear(**payload)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/sections", dependencies=[Depends(require_permission("admin.settings"))])
def create_section(payload: StructureIn, db: Session = Depends(get_db)):
    item = Section(nom=payload.nom, description=payload.description)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/options", dependencies=[Depends(require_permission("admin.settings"))])
def create_option(payload: StructureIn, db: Session = Depends(get_db)):
    item = Option(nom=payload.nom, section_id=payload.section_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/classes", dependencies=[Depends(require_permission("admin.settings"))])
def create_class(payload: StructureIn, db: Session = Depends(get_db)):
    item = ClassRoom(nom=payload.nom, niveau=payload.niveau, option_id=payload.option_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/fee-types", dependencies=[Depends(require_permission("admin.settings"))])
def create_fee_type(payload: StructureIn, db: Session = Depends(get_db)):
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
