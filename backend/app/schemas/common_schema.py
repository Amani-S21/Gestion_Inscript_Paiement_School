from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class AcademicYearIn(BaseModel):
    libelle: str
    date_debut: date | None = None
    date_fin: date | None = None
    active: bool = False


class StructureIn(BaseModel):
    nom: str
    description: str | None = None
    section_id: int | None = None
    option_id: int | None = None
    niveau: str | None = None


class FeeIn(BaseModel):
    fee_type_id: int
    academic_year_id: int
    class_id: int | None = None
    montant: Decimal
    devise: str = "USD"


class PaymentIn(BaseModel):
    student_id: int
    fee_id: int
    montant: Decimal
    devise: str = "USD"


class RegistrationIn(BaseModel):
    student_id: int
    academic_year_id: int
    classroom_id: int
    type_inscription: str = "nouvelle"
    date_inscription: date | None = None


class AnnouncementIn(BaseModel):
    titre: str
    contenu: str
    statut: str = "publie"


class ItemOut(BaseModel):
    id: int
    model_config = {"from_attributes": True}


class PaymentOut(BaseModel):
    id: int
    student_id: int
    fee_id: int
    montant: Decimal
    devise: str
    statut: str
    reference: str
    date_paiement: datetime
    model_config = {"from_attributes": True}

