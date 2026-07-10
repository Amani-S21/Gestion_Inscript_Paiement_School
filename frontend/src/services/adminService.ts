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

export async function getRoles() {
  const { data } = await api.get("/api/roles");
  return data;
}

export async function getPermissions() {
  const { data } = await api.get("/api/permissions");
  return data;
}
