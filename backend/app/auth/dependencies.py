from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session, joinedload

from app.auth.access import is_admin, permission_codes
from app.config import settings
from app.database.session import get_db
from app.models.user import Role, User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou expire.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        token_type = payload.get("type")
        if user_id is None or token_type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = (
        db.query(User)
        .options(joinedload(User.roles).joinedload(Role.permissions), joinedload(User.student))
        .filter(User.id == int(user_id))
        .first()
    )
    if user is None or user.statut != "actif":
        raise credentials_exception
    return user


def require_permission(permission: str) -> Callable[..., User]:
    def checker(current_user: User = Depends(get_current_user)) -> User:
        if is_admin(current_user) or permission in permission_codes(current_user):
            return current_user
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission insuffisante.")

    return checker


def require_role(role_code: str) -> Callable[..., User]:
    def checker(current_user: User = Depends(get_current_user)) -> User:
        if role_code in {role.code for role in current_user.roles} or current_user.type_utilisateur == role_code:
            return current_user
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Role insuffisant.")

    return checker

