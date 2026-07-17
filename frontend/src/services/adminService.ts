import { api } from "./api";

export async function getDashboard() {
  const { data } = await api.get("/api/dashboard");
  return data;
}

export async function getStudents(params?: { q?: string; page?: number; size?: number }) {
  const { data } = await api.get("/api/students", { params });
  return data;
}

export async function getPayments(params?: { page?: number; size?: number }) {
  const { data } = await api.get("/api/payments", { params });
  return data;
}

export async function createPayment(payload: { student_id: number; fee_id: number; montant: string | number; devise?: string }) {
  const { data } = await api.post("/api/payments", payload);
  return data;
}

export async function getRegistrations(params?: { page?: number; size?: number }) {
  const { data } = await api.get("/api/registrations", { params });
  return data;
}

export async function createRegistration(payload: {
  student_id: number;
  academic_year_id: number;
  classroom_id: number;
  type_inscription: string;
  date_inscription?: string;
}) {
  const { data } = await api.post("/api/registrations", payload);
  return data;
}

export async function getAcademicYears() {
  const { data } = await api.get("/api/academic-years");
  return data;
}

export async function getSections() {
  const { data } = await api.get("/api/sections");
  return data;
}

export async function getOptions() {
  const { data } = await api.get("/api/options");
  return data;
}

export async function getClasses() {
  const { data } = await api.get("/api/classes");
  return data;
}

export async function getFees() {
  const { data } = await api.get("/api/fees");
  return data;
}

export async function createAcademicYear(payload: { libelle: string; date_debut?: string; date_fin?: string; active?: boolean }) {
  const { data } = await api.post("/api/academic-years", payload);
  return data;
}

export async function closeAcademicYear(yearId: string | number) {
  const { data } = await api.patch(`/api/academic-years/${yearId}/close`);
  return data;
}

export async function createSection(payload: { nom: string; description?: string }) {
  const { data } = await api.post("/api/sections", payload);
  return data;
}

export async function createOption(payload: { nom: string; section_id: number }) {
  const { data } = await api.post("/api/options", payload);
  return data;
}

export async function createClassroom(payload: { nom: string; niveau?: string; option_id: number }) {
  const { data } = await api.post("/api/classes", payload);
  return data;
}

export async function createFeeType(payload: { nom: string; description?: string }) {
  const { data } = await api.post("/api/fee-types", payload);
  return data;
}

export async function createFee(payload: { fee_type_id: number; academic_year_id: number; class_id?: number | null; montant: string | number; devise?: string }) {
  const { data } = await api.post("/api/fees", payload);
  return data;
}

export async function createStudent(payload: {
  nom: string;
  postnom?: string;
  prenom?: string;
  email: string;
  login: string;
  password?: string;
  telephone?: string;
  adresse?: string;
  matricule: string;
  sexe?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  nom_tuteur?: string;
  telephone_tuteur?: string;
}) {
  const { data } = await api.post("/api/students", payload);
  return data;
}

export async function updateStudent(studentId: string | number, payload: {
  nom?: string;
  postnom?: string;
  prenom?: string;
  email?: string;
  login?: string;
  password?: string;
  telephone?: string;
  adresse?: string;
  matricule?: string;
  sexe?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  nom_tuteur?: string;
  telephone_tuteur?: string;
}) {
  const { data } = await api.patch(`/api/students/${studentId}`, payload);
  return data;
}

export async function updateStudentStatus(studentId: string | number, statut: "actif" | "inactif") {
  const { data } = await api.patch(`/api/students/${studentId}/status`, { statut });
  return data;
}

export async function deleteStudent(studentId: string | number) {
  const { data } = await api.delete(`/api/students/${studentId}`);
  return data;
}

export async function getReportsOverview() {
  const { data } = await api.get("/api/reports/overview");
  return data;
}

export async function getAnnouncements() {
  const { data } = await api.get("/api/announcements");
  return data;
}

export async function createAnnouncement(payload: { titre: string; contenu: string; statut?: string }) {
  const { data } = await api.post("/api/announcements", payload);
  return data;
}

export async function getReclamations(params?: { page?: number; size?: number }) {
  const { data } = await api.get("/api/reclamations", { params });
  return data;
}

export async function createReclamation(payload: { payment_id?: number | null; subject: string; message: string }) {
  const { data } = await api.post("/api/reclamations", payload);
  return data;
}

export async function updateReclamation(id: string | number, payload: { status: string; response?: string }) {
  const { data } = await api.patch(`/api/reclamations/${id}`, payload);
  return data;
}

export async function downloadReceiptPdf(paymentId: string | number, fileName = "recu-paiement.pdf") {
  const { data } = await api.get(`/api/payments/${paymentId}/receipt/pdf`, { responseType: "blob" });
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export async function getUsers(params?: { q?: string; page?: number; size?: number }) {
  const { data } = await api.get("/api/users", { params });
  return data;
}

export async function createUser(payload: {
  nom: string;
  prenom?: string;
  email: string;
  login: string;
  password?: string;
  role_code: string;
}) {
  const { data } = await api.post("/api/users", payload);
  return data;
}

export async function updateUserStatus(userId: string, statut: "actif" | "inactif") {
  const { data } = await api.patch(`/api/users/${userId}/status`, { statut });
  return data;
}

export async function getRoles() {
  const { data } = await api.get("/api/roles");
  return data;
}

export async function getPermissions() {
  const { data } = await api.get("/api/permissions");
  return data;
}
