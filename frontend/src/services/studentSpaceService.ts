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

export function receiptPdfUrl(receiptId: number) {
  return `${api.defaults.baseURL}/student/me/receipts/${receiptId}/pdf`;
}

export function cardPdfUrl() {
  return `${api.defaults.baseURL}/student/me/card/pdf`;
}

