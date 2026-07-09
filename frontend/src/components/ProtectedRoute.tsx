import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ permission, role }: { permission?: string; role?: string }) {
  const { user, loading, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  if (loading) return <div className="grid min-h-screen place-items-center text-slate-500">Chargement...</div>;
  if (!user) return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
  if (permission && !hasPermission(permission)) return <Navigate to="/forbidden" replace />;
  if (role && !hasRole(role)) return <Navigate to="/forbidden" replace />;
  return <Outlet />;
}

