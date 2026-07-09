import { api } from "./api";

export async function getDashboard() {
  const { data } = await api.get("/api/dashboard");
  return data;
}

export async function getStudents(params?: { q?: string; page?: number; size?: number }) {
  const { data } = await api.get("/api/students", { params });
  return data;
}

export async function getPayments() {
  const { data } = await api.get("/api/payments");
  return data;
}

