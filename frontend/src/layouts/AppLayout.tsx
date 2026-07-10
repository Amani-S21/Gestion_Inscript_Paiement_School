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
    <div className="min-h-screen bg-[#eef5f6] pl-[150px] text-slate-900 lg:pl-[248px]">
      <aside className="fixed bottom-2 left-2 top-2 z-30 flex w-[136px] flex-col rounded-[14px] border border-white/15 bg-[#10242f]/95 text-white shadow-xl shadow-slate-950/20 backdrop-blur-xl lg:bottom-0 lg:left-0 lg:top-0 lg:w-[248px] lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r lg:border-white/10 lg:bg-[#10242f]">
        <div className="hidden items-center gap-3 px-4 py-4 lg:flex">
          <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-gradient-to-br from-emerald-300 to-sky-300 text-[#10242f] shadow-lg shadow-emerald-950/20">
            <Building2 size={20} />
          </div>
          <div>
            <p className="heading text-[14px] font-extrabold">NENGAPETA</p>
            <p className="text-[10px] font-medium text-sky-50/65">Gestion scolaire</p>
          </div>
        </div>
        <div className="mx-4 hidden h-px bg-white/10 lg:block" />
        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-2 lg:px-3 lg:py-4">
          {visibleItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `group flex h-auto w-full items-center justify-start gap-2 rounded-[10px] px-2.5 py-2 text-[10.5px] font-bold transition duration-200 lg:gap-2.5 lg:px-3 lg:text-[12px] ${
                  isActive
                    ? "bg-emerald-400 text-[#10242f] shadow-lg shadow-emerald-950/25"
                    : "text-slate-300 hover:bg-white/10 hover:text-white lg:hover:translate-x-1"
                }`
              }
              style={{ animationDelay: `${index * 35}ms` }}
              title={item.label}
            >
              <item.icon size={14} className="shrink-0 transition group-hover:scale-110" />
              <span className="min-w-0 truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="hidden border-t border-white/10 p-3 lg:block">
          <div className="mb-2.5 flex items-center gap-2 rounded-[12px] bg-white/8 p-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-amber-300 text-[11px] font-extrabold text-[#10242f]">
              {(user?.prenom || user?.nom || "U").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-extrabold text-white">{user?.prenom || user?.nom || "Utilisateur"}</p>
              <p className="truncate text-[10px] font-medium text-slate-300">{user?.type_utilisateur || "Connecte"}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-white/10 px-3 py-2 text-[12px] font-bold text-white transition hover:bg-rose-500/90"
            title="Deconnexion"
          >
            <LogOut size={15} />
            Deconnexion
          </button>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="mb-2 ml-2 grid h-9 w-9 place-items-center rounded-[10px] bg-white/10 text-white transition hover:bg-rose-500/90 lg:hidden"
          title="Deconnexion"
        >
          <LogOut size={15} />
        </button>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-10 border-b border-white/70 bg-white/80 px-4 py-2.5 shadow-sm shadow-slate-900/5 backdrop-blur-xl md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-emerald-700">Institut NENGAPETA</p>
              <h1 className="heading text-[15px] font-extrabold text-[#0b1f33] md:text-[18px]">Gestion des inscriptions et paiements</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="grid h-8 w-8 place-items-center rounded-[9px] border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700" title="Notifications">
                <Bell size={15} />
              </button>
              <div className="hidden items-center gap-2 rounded-[9px] border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm md:flex">
                <UserRound size={15} className="text-emerald-700" />
                <span className="text-[12px] font-bold text-slate-700">{user?.prenom || user?.nom}</span>
              </div>
            </div>
          </div>
        </header>
        <div className="relative p-3 md:p-5">
          <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(14,165,233,0.12),transparent_25rem),radial-gradient(circle_at_82%_72%,rgba(16,185,129,0.13),transparent_24rem)]" />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
