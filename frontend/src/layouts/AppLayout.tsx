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
  const visibleItems = items.filter((item) => hasPermission(item.permission));

  return (
    <div className="min-h-screen bg-[#eef5f6] text-slate-900 lg:grid lg:grid-cols-[minmax(0,1fr)_292px]">
      <main className="min-w-0 pb-24 lg:pb-0">
        <header className="sticky top-0 z-10 border-b border-white/70 bg-white/80 px-4 py-4 shadow-sm shadow-slate-900/5 backdrop-blur-xl md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Institut NENGAPETA</p>
              <h1 className="heading text-lg font-extrabold text-[#0b1f33] md:text-2xl">Gestion des inscriptions et paiements</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="grid h-10 w-10 place-items-center rounded-[10px] border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700" title="Notifications">
                <Bell size={18} />
              </button>
              <div className="hidden items-center gap-3 rounded-[10px] border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex">
                <UserRound size={18} className="text-emerald-700" />
                <span className="text-sm font-bold text-slate-700">{user?.prenom || user?.nom}</span>
              </div>
            </div>
          </div>
        </header>
        <div className="relative p-4 md:p-8">
          <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(14,165,233,0.12),transparent_25rem),radial-gradient(circle_at_82%_72%,rgba(16,185,129,0.13),transparent_24rem)]" />
          <Outlet />
        </div>
      </main>

      <aside className="fixed inset-x-3 bottom-3 z-30 rounded-[18px] border border-white/15 bg-[#0b1f33]/95 text-white shadow-2xl shadow-slate-950/25 backdrop-blur-xl lg:sticky lg:inset-auto lg:top-0 lg:flex lg:h-screen lg:flex-col lg:rounded-none lg:border-l lg:border-white/10 lg:bg-[#0b1f33]">
        <div className="hidden items-center gap-3 px-5 py-5 lg:flex">
          <div className="grid h-11 w-11 place-items-center rounded-[12px] bg-emerald-300 text-[#0b1f33] shadow-lg shadow-emerald-950/20">
            <Building2 size={24} />
          </div>
          <div>
            <p className="heading text-lg font-bold">NENGAPETA</p>
            <p className="text-xs text-sky-50/70">Inscriptions & paiements</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-1 lg:flex-col lg:gap-2 lg:overflow-visible lg:px-4 lg:pb-4">
          {visibleItems
            .map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `group flex min-w-[74px] flex-col items-center justify-center gap-1 rounded-[12px] px-3 py-2 text-[11px] font-bold transition duration-200 lg:min-w-0 lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:py-3 lg:text-sm ${
                    isActive
                      ? "bg-emerald-300 text-[#0b1f33] shadow-lg shadow-emerald-950/20"
                      : "text-sky-50/75 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white lg:hover:translate-x-[-3px] lg:hover:translate-y-0"
                  }`
                }
                style={{ animationDelay: `${index * 35}ms` }}
              >
                <item.icon size={18} className="transition group-hover:scale-110" />
                <span className="max-w-[74px] truncate lg:max-w-none">{item.label}</span>
              </NavLink>
            ))}
        </nav>
        <div className="hidden border-t border-white/10 p-4 lg:block">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-500/90"
            title="Deconnexion"
          >
            <LogOut size={18} />
            Deconnexion
          </button>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="absolute -top-12 right-0 grid h-10 w-10 place-items-center rounded-[12px] bg-[#0b1f33] text-white shadow-lg shadow-slate-950/20 lg:hidden"
          title="Deconnexion"
        >
          <LogOut size={18} />
        </button>
      </aside>
    </div>
  );
}
