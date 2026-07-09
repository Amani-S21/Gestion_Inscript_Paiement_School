export type StudentProfile = {
  id: number;
  matricule: string;
  nom_complet: string;
  email: string;
  telephone?: string | null;
  adresse?: string | null;
  photo_url?: string | null;
  sexe?: string | null;
  date_naissance?: string | null;
  lieu_naissance?: string | null;
  nom_tuteur?: string | null;
  telephone_tuteur?: string | null;
};

export type StudentDashboard = {
  profile: StudentProfile;
  classe?: string | null;
  option?: string | null;
  annee_scolaire?: string | null;
  total_paiements: number;
  montant_total_frais: string;
  montant_total_paye: string;
  solde_restant: string;
  dernier_paiement?: string | null;
  etat_frais: "paye" | "partiellement_paye" | "impaye";
  derniers_recus: Array<{ id: number; numero: string; payment_id: number }>;
  notifications: Array<{ id: number; titre: string; message: string; lu: boolean }>;
};

