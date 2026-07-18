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

export async function updateAcademicYear(yearId: string | number, payload: { libelle: string; date_debut?: string; date_fin?: string; active?: boolean }) {
  const { data } = await api.patch(`/api/academic-years/${yearId}`, payload);
  return data;
}

export async function deleteAcademicYear(yearId: string | number) {
  const { data } = await api.delete(`/api/academic-years/${yearId}`);
  return data;
}

export async function createSection(payload: { nom: string; description?: string }) {
  const { data } = await api.post("/api/sections", payload);
  return data;
}

export async function updateSection(sectionId: string | number, payload: { nom: string; description?: string }) {
  const { data } = await api.patch(`/api/sections/${sectionId}`, payload);
  return data;
}

export async function deleteSection(sectionId: string | number) {
  const { data } = await api.delete(`/api/sections/${sectionId}`);
  return data;
}

export async function createOption(payload: { nom: string; section_id: number }) {
  const { data } = await api.post("/api/options", payload);
  return data;
}

export async function updateOption(optionId: string | number, payload: { nom: string; section_id: number }) {
  const { data } = await api.patch(`/api/options/${optionId}`, payload);
  return data;
}

export async function deleteOption(optionId: string | number) {
  const { data } = await api.delete(`/api/options/${optionId}`);
  return data;
}

export async function createClassroom(payload: { nom: string; niveau?: string; option_id: number }) {
  const { data } = await api.post("/api/classes", payload);
  return data;
}

export async function updateClassroom(classId: string | number, payload: { nom: string; niveau?: string; option_id: number }) {
  const { data } = await api.patch(`/api/classes/${classId}`, payload);
  return data;
}

export async function deleteClassroom(classId: string | number) {
  const { data } = await api.delete(`/api/classes/${classId}`);
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

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/api/uploads/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as { url: string };
}

export async function updateFee(feeId: string | number, payload: { fee_type_id: number; academic_year_id: number; class_id?: number | null; montant: string | number; devise?: string }) {
  const { data } = await api.patch(`/api/fees/${feeId}`, payload);
  return data;
}

export async function deleteFee(feeId: string | number) {
  const { data } = await api.delete(`/api/fees/${feeId}`);
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
  matricule?: string;
  photo_url?: string;
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
  photo_url?: string;
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

function downloadBlob(data: BlobPart, fileName: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

type DownloadPayload = {
  file_name: string;
  content_type: string;
  content_base64: string;
};

function downloadBase64File(payload: DownloadPayload, fallbackFileName: string) {
  const binary = window.atob(payload.content_base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  downloadBlob(bytes, payload.file_name || fallbackFileName, payload.content_type);
}

export async function downloadStudentCardPdf(studentId: string | number, fileName = "carte-eleve.pdf") {
  const { data } = await api.get<DownloadPayload>(`/api/students/${studentId}/card/pdf-data`);
  downloadBase64File(data, fileName);
}

export async function downloadAllStudentCards(fileName = "cartes-eleves.zip") {
  const { data } = await api.get<DownloadPayload>("/api/students/cards/pdf-data");
  downloadBase64File(data, fileName);
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

export async function getPublicMarketingMedia() {
  const { data } = await api.get("/api/public/marketing-media");
  return data;
}

export async function getMarketingMedia() {
  const { data } = await api.get("/api/marketing-media");
  return data;
}

export async function createMarketingMedia(payload: { title: string; description?: string; image_url: string; statut?: string }) {
  const { data } = await api.post("/api/marketing-media", payload);
  return data;
}

export async function deleteMarketingMedia(mediaId: string | number) {
  const { data } = await api.delete(`/api/marketing-media/${mediaId}`);
  return data;
}

export async function getReclamations(params?: { page?: number; size?: number }) {
  const { data } = await api.get("/api/reclamations", { params });
  return data;
}

export async function createReclamation(payload: { payment_id?: number | null; recipient?: string; subject: string; message: string }) {
  const { data } = await api.post("/api/reclamations", payload);
  return data;
}

export async function updateReclamation(id: string | number, payload: { status: string; response?: string }) {
  const { data } = await api.patch(`/api/reclamations/${id}`, payload);
  return data;
}

export async function downloadReceiptPdf(paymentId: string | number, fileName = "recu-paiement.pdf") {
  const { data } = await api.get(`/api/payments/${paymentId}/receipt/pdf`, { responseType: "blob" });
  downloadBlob(data, fileName, "application/pdf");
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
