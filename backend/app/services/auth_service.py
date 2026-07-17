from sqlalchemy.orm import Session

from app.auth.jwt_handler import create_access_token, create_refresh_token
from app.auth.password_handler import verify_password
from app.models.user import User


def authenticate_user(db: Session, login: str, password: str) -> User | None:
    user = db.query(User).filter(User.login == login).first()
    if not user or user.statut != "actif" or not verify_password(password, user.mot_de_passe):
        return None
    return user


def make_token_pair(user: User) -> dict[str, str]:
    return {
        "access_token": create_access_token(str(user.id), user.type_utilisateur),
        "refresh_token": create_refresh_token(str(user.id)),
        "token_type": "bearer",
    }

