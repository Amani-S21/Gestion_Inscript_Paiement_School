from fastapi import HTTPException, status

from app.models.user import User
from app.permissions.codes import ROLE_ADMIN, ROLE_ELEVE, ROLE_PERMISSION_MAP


def role_codes(user: User) -> set[str]:
    return {role.code for role in user.roles}


def permission_codes(user: User) -> set[str]:
    permissions = {permission.code for role in user.roles for permission in role.permissions}
    permissions.update(ROLE_PERMISSION_MAP.get(user.type_utilisateur, []))
    for role in user.roles:
        permissions.update(ROLE_PERMISSION_MAP.get(role.code, []))
    return permissions


def is_admin(user: User) -> bool:
    return user.type_utilisateur == ROLE_ADMIN or ROLE_ADMIN in role_codes(user)


def is_student(user: User) -> bool:
    return user.type_utilisateur == ROLE_ELEVE or ROLE_ELEVE in role_codes(user)


def ensure_student_owns(current_user: User, student_id: int) -> None:
    if is_admin(current_user):
        return
    if not is_student(current_user) or not current_user.student:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acces interdit.")
    if current_user.student.id != student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acces limite a vos donnees.")

