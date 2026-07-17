from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.password_handler import hash_password, verify_password
from app.config import settings
from app.database.session import get_db
from app.models.user import User
from app.permissions.codes import ROLE_PERMISSION_MAP
from app.schemas.auth_schema import PasswordChange, TokenResponse, UserMe
from app.services.auth_service import authenticate_user, make_token_pair

router = APIRouter(prefix="/auth", tags=["Authentification"])


def user_response(user: User) -> UserMe:
    permissions = {permission.code for role in user.roles for permission in role.permissions}
    permissions.update(ROLE_PERMISSION_MAP.get(user.type_utilisateur, []))
    for role in user.roles:
        permissions.update(ROLE_PERMISSION_MAP.get(role.code, []))
    return UserMe(
        id=user.id,
        nom=user.nom,
        postnom=user.postnom,
        prenom=user.prenom,
        email=user.email,
        login=user.login,
        telephone=user.telephone,
        adresse=user.adresse,
        photo_url=user.photo_url,
        type_utilisateur=user.type_utilisateur,
        roles=[role.code for role in user.roles],
        permissions=sorted(permissions),
        student_id=user.student.id if user.student else None,
    )


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login ou mot de passe incorrect.")
    if user.statut != "actif":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Compte desactive.")
    return make_token_pair(user)


@router.post("/refresh", response_model=TokenResponse)
def refresh(refresh_token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            raise JWTError()
        user_id = int(payload["sub"])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token invalide.")
    user = db.get(User, user_id)
    if not user or user.statut != "actif":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utilisateur invalide.")
    return make_token_pair(user)


@router.get("/me", response_model=UserMe)
def me(current_user: User = Depends(get_current_user)):
    return user_response(current_user)


@router.post("/change-password")
def change_password(payload: PasswordChange, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(payload.current_password, current_user.mot_de_passe):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mot de passe actuel incorrect.")
    current_user.mot_de_passe = hash_password(payload.new_password)
    db.commit()
    return {"message": "Mot de passe modifie."}

