import { Navigate, createBrowserRouter } from "react-router-dom";

import { ProtectedRoute } from "../components/ProtectedRoute";
import { AppLayout } from "../layouts/AppLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { LandingPage } from "../pages/landing/LandingPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { StudentsPage } from "../pages/students/StudentsPage";
import { RegistrationsPage } from "../pages/registrations/RegistrationsPage";
import { PaymentsPage } from "../pages/payments/PaymentsPage";
import { ReportsPage } from "../pages/reports/ReportsPage";
import { AdministrationPage } from "../pages/administration/AdministrationPage";
import { StudentSpacePage } from "../pages/student-space/StudentSpacePage";
import { ReclamationsPage } from "../pages/reclamations/ReclamationsPage";
import { useAuth } from "../contexts/AuthContext";

function AppHome() {
  const { hasRole } = useAuth();
  if (hasRole("ROLE_ELEVE")) return <Navigate to="/app/student" replace />;
  return <DashboardPage />;
}

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/forbidden", element: <div className="grid min-h-screen place-items-center text-slate-600">Accès non autorisé.</div> },
  {
    path: "/app",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <AppHome /> },
          {
            element: <ProtectedRoute permission="students.view" />,
            children: [{ path: "students", element: <StudentsPage /> }],
          },
          {
            element: <ProtectedRoute permission="registrations.view" />,
            children: [{ path: "registrations", element: <RegistrationsPage /> }],
          },
          {
            element: <ProtectedRoute permission="payments.view" />,
            children: [{ path: "payments", element: <PaymentsPage /> }],
          },
          {
            element: <ProtectedRoute permission="reports.view" />,
            children: [{ path: "reports", element: <ReportsPage /> }],
          },
          {
            element: <ProtectedRoute permission="reclamations.view" />,
            children: [{ path: "reclamations", element: <ReclamationsPage /> }],
          },
          {
            element: <ProtectedRoute permission="admin.settings" />,
            children: [{ path: "administration", element: <AdministrationPage /> }],
          },
          {
            element: <ProtectedRoute role="ROLE_ELEVE" permission="student.self.view" />,
            children: [{ path: "student", element: <StudentSpacePage /> }],
          },
        ],
      },
    ],
  },
]);
