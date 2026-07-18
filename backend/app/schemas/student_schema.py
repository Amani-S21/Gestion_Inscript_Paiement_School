from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr


class StudentCreate(BaseModel):
    nom: str
    postnom: str | None = None
    prenom: str | None = None
    email: EmailStr
    login: str
    password: str | None = None
    telephone: str | None = None
    adresse: str | None = None
    matricule: str | None = None
    photo_url: str | None = None
    sexe: str | None = None
    date_naissance: date | None = None
    lieu_naissance: str | None = None
    nom_tuteur: str | None = None
    telephone_tuteur: str | None = None


class StudentUpdate(BaseModel):
    nom: str | None = None
    postnom: str | None = None
    prenom: str | None = None
    matricule: str | None = None
    login: str | None = None
    password: str | None = None
    telephone: str | None = None
    adresse: str | None = None
    email: EmailStr | None = None
    photo_url: str | None = None
    sexe: str | None = None
    date_naissance: date | None = None
    lieu_naissance: str | None = None
    nom_tuteur: str | None = None
    telephone_tuteur: str | None = None


class StudentProfile(BaseModel):
    id: int
    matricule: str
    nom_complet: str
    email: EmailStr
    telephone: str | None = None
    adresse: str | None = None
    photo_url: str | None = None
    sexe: str | None = None
    date_naissance: date | None = None
    lieu_naissance: str | None = None
    nom_tuteur: str | None = None
    telephone_tuteur: str | None = None


class StudentDashboard(BaseModel):
    profile: StudentProfile
    classe: str | None = None
    option: str | None = None
    annee_scolaire: str | None = None
    total_paiements: int
    montant_total_frais: Decimal
    montant_total_paye: Decimal
    solde_restant: Decimal
    dernier_paiement: datetime | None = None
    etat_frais: str
    derniers_recus: list[dict]
    notifications: list[dict]

