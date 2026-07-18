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
  const url = window.URL.createObjectURL(new Blob([bytes], { type: payload.content_type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = payload.file_name || fallbackFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadStudentReceiptPdf(receiptId: number, fileName = "recu-paiement.pdf") {
  const { data } = await api.get(`/student/me/receipts/${receiptId}/pdf`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadStudentCardPdf(fileName = "carte-eleve.pdf") {
  const { data } = await api.get<DownloadPayload>("/student/me/card/pdf-data");
  downloadBase64File(data, fileName);
}

