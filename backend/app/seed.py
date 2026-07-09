from sqlalchemy.orm import Session

from app.auth.password_handler import hash_password
from app.config import settings
from app.models.user import Permission, Role, User
from app.permissions.codes import ROLE_ADMIN, ROLE_PERMISSION_MAP


ROLE_NAMES = {
    "ROLE_ADMIN": "Administrateur systeme",
    "ROLE_COMPTABLE": "Comptable",
    "ROLE_SECRETAIRE": "Secretaire",
    "ROLE_PREFET": "Prefet des etudes",
    "ROLE_DIRECTION": "Direction",
    "ROLE_ELEVE": "Eleve",
}


def seed_initial_data(db: Session) -> None:
    permissions_by_code: dict[str, Permission] = {}
    for permission_code in sorted({p for values in ROLE_PERMISSION_MAP.values() for p in values}):
        permission = db.query(Permission).filter(Permission.code == permission_code).first()
        if not permission:
            permission = Permission(code=permission_code, description=permission_code)
            db.add(permission)
            db.flush()
        permissions_by_code[permission_code] = permission

    roles_by_code: dict[str, Role] = {}
    for role_code, permission_codes in ROLE_PERMISSION_MAP.items():
        role = db.query(Role).filter(Role.code == role_code).first()
        if not role:
            role = Role(code=role_code, nom=ROLE_NAMES[role_code], description=ROLE_NAMES[role_code])
            db.add(role)
            db.flush()
        role.permissions = [permissions_by_code[code] for code in permission_codes if code in permissions_by_code]
        roles_by_code[role_code] = role

    admin = db.query(User).filter(User.login == settings.DEFAULT_ADMIN_LOGIN).first()
    if not admin:
        admin = User(
            nom="Administrateur",
            prenom="Systeme",
            email=settings.DEFAULT_ADMIN_EMAIL,
            login=settings.DEFAULT_ADMIN_LOGIN,
            mot_de_passe=hash_password(settings.DEFAULT_ADMIN_PASSWORD),
            statut="actif",
            type_utilisateur=ROLE_ADMIN,
        )
        db.add(admin)
    if roles_by_code[ROLE_ADMIN] not in admin.roles:
        admin.roles.append(roles_by_code[ROLE_ADMIN])
    db.commit()

