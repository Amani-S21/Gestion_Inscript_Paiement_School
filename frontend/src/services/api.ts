import axios from "axios";

function defaultApiUrl() {
  if (typeof window === "undefined") return "http://localhost:8000";
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8000`;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuth = String(error.config?.url ?? "").startsWith("/auth");
    if (error.response?.status === 401 && !isAuth) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.assign(`/login?from=${encodeURIComponent(window.location.pathname)}`);
    }
    return Promise.reject(error);
  }
);

