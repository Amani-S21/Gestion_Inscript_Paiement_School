export type RoleCode =
  | "ROLE_ADMIN"
  | "ROLE_COMPTABLE"
  | "ROLE_SECRETAIRE"
  | "ROLE_PREFET"
  | "ROLE_DIRECTION"
  | "ROLE_ELEVE";

export type AuthUser = {
  id: number;
  nom: string;
  postnom?: string | null;
  prenom?: string | null;
  email: string;
  login: string;
  telephone?: string | null;
  adresse?: string | null;
  photo_url?: string | null;
  type_utilisateur: RoleCode;
  roles: RoleCode[];
  permissions: string[];
  student_id?: number | null;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
};

