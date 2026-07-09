import {
  Bell,
  BookOpen,
  Building2,
  CreditCard,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { to: "/students", label: "Eleves", icon: Users, permission: "students.view" },
  { to: "/registrations", label: "Inscriptions", icon: BookOpen, permission: "registrations.view" },
  { to: "/payments", label: "Paiements", icon: CreditCard, permission: "payments.view" },
  { to: "/reports", label: "Rapports", icon: FileBarChart, permission: "reports.view" },
  { to: "/administration", label: "Administration", icon: Settings, permission: "admin.settings" },
  { to: "/student", label: "Mon espace", icon: GraduationCap, permission: "student.self.view" },
];

export function AppLayout() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 z-20 flex h-auto flex-col border-b border-slate-200 bg-[#102a2b] text-white lg:h-screen lg:border-b-0">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="grid h-11 w-11 place-items-center rounded-[8px] bg-teal-400 text-[#102a2b]">
            <Building2 size={24} />
          </div>
          <div>
            <p className="heading text-lg font-bold">NENGAPETA</p>
            <p className="text-xs text-teal-100">Inscriptions & paiements</p>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-4 lg:flex-1 lg:flex-col lg:overflow-visible">
          {items
            .filter((item) => hasPermission(item.permission))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex min-w-max items-center gap-3 rounded-[8px] px-4 py-3 text-sm font-semibold transition ${
                    isActive ? "bg-teal-400 text-[#102a2b]" : "text-teal-50 hover:bg-white/10"
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
        </nav>
      </aside>
      <main className="min-w-0">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Institut NENGAPETA</p>
            <h1 className="heading text-xl font-bold text-slate-950">Gestion des inscriptions et paiements</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-[8px] border border-slate-200 bg-white text-slate-600" title="Notifications">
              <Bell size={18} />
            </button>
            <div className="hidden items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-3 py-2 md:flex">
              <UserRound size={18} className="text-teal-700" />
              <span className="text-sm font-semibold text-slate-700">{user?.prenom || user?.nom}</span>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="grid h-10 w-10 place-items-center rounded-[8px] bg-slate-950 text-white"
              title="Deconnexion"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

