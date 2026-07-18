import { api } from "./api";
import type { StudentDashboard, StudentProfile } from "../types/student";

export async function getStudentDashboard() {
  const { data } = await api.get<StudentDashboard>("/student/me/dashboard");
  return data;
}

export async function getStudentProfile() {
  const { data } = await api.get<StudentProfile>("/student/me/profile");
  return data;
}

export async function updateStudentProfile(payload: Partial<StudentProfile>) {
  const { data } = await api.patch<StudentProfile>("/student/me/profile", payload);
  return data;
}

function downloadBlob(data: BlobPart, fileName: string) {
  const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadStudentReceiptPdf(receiptId: number, fileName = "recu-paiement.pdf") {
  const { data } = await api.get(`/student/me/receipts/${receiptId}/pdf`, { responseType: "blob" });
  downloadBlob(data, fileName);
}

export async function downloadStudentCardPdf(fileName = "carte-eleve.pdf") {
  const { data } = await api.get("/student/me/card/pdf", { responseType: "blob" });
  downloadBlob(data, fileName);
}

