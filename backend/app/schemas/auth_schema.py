from pydantic import BaseModel, EmailStr


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserMe(BaseModel):
    id: int
    nom: str
    postnom: str | None = None
    prenom: str | None = None
    email: EmailStr
    login: str
    telephone: str | None = None
    adresse: str | None = None
    photo_url: str | None = None
    type_utilisateur: str
    roles: list[str]
    permissions: list[str]
    student_id: int | None = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

