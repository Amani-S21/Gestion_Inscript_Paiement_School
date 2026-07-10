ROLE_ADMIN = "ROLE_ADMIN"
ROLE_COMPTABLE = "ROLE_COMPTABLE"
ROLE_SECRETAIRE = "ROLE_SECRETAIRE"
ROLE_PREFET = "ROLE_PREFET"
ROLE_DIRECTION = "ROLE_DIRECTION"
ROLE_ELEVE = "ROLE_ELEVE"

PERMISSIONS = {
    "dashboard.view",
    "students.manage",
    "students.view",
    "registrations.manage",
    "registrations.view",
    "payments.manage",
    "payments.view",
    "receipts.print",
    "reports.finance",
    "reports.view",
    "admin.settings",
    "admin.users",
    "admin.roles",
    "audit.view",
    "student.self.view",
    "student.self.update",
    "student.receipts.download",
    "student.card.download",
    "announcements.view",
    "announcements.manage",
    "notifications.view",
}

ROLE_PERMISSION_MAP = {
    ROLE_ADMIN: sorted(PERMISSIONS - {"student.self.view", "student.self.update"}),
    ROLE_COMPTABLE: [
        "dashboard.view",
        "students.manage",
        "students.view",
        "registrations.manage",
        "registrations.view",
        "payments.manage",
        "payments.view",
        "receipts.print",
        "reports.finance",
        "reports.view",
    ],
    ROLE_SECRETAIRE: [
        "dashboard.view",
        "students.manage",
        "students.view",
        "registrations.manage",
        "registrations.view",
    ],
    ROLE_PREFET: [
        "dashboard.view",
        "students.view",
        "registrations.view",
        "reports.view",
    ],
    ROLE_DIRECTION: [
        "dashboard.view",
        "students.view",
        "registrations.view",
        "payments.view",
        "reports.view",
        "reports.finance",
    ],
    ROLE_ELEVE: [
        "student.self.view",
        "student.self.update",
        "student.receipts.download",
        "student.card.download",
        "announcements.view",
        "notifications.view",
    ],
}
