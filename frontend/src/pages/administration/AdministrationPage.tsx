import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Layers3, Plus, School, Settings2, ShieldCheck, UsersRound } from "lucide-react";

import { createUser, getRoles, getUsers } from "../../services/adminService";

const modules = [
  { title: "Annees scolaires", description: "Ouverture, cloture et suivi des exercices.", icon: School },
  { title: "Sections, options, classes", description: "Structure pedagogique de l'institut.", icon: Layers3 },
  { title: "Frais scolaires", description: "Types de frais, montants et affectations.", icon: Settings2 },
  { title: "Utilisateurs", description: "Comptes admin, comptables, secretariat et eleves.", icon: UsersRound },
  { title: "Roles et permissions", description: "Acces stricts par responsabilite.", icon: ShieldCheck },
  { title: "Securite", description: "Sessions, mots de passe et sauvegardes.", icon: KeyRound },
];

const roleLabels: Record<string, string> = {
  ROLE_ADMIN: "Administrateur",
  ROLE_COMPTABLE: "Comptable",
  ROLE_SECRETAIRE: "Secretaire",
  ROLE_PREFET: "Prefet",
  ROLE_DIRECTION: "Direction",
  ROLE_ELEVE: "Eleve",
};

export function AdministrationPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    login: "",
    password: "",
    role_code: "ROLE_COMPTABLE",
  });
  const [message, setMessage] = useState("");

  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: () => getUsers({ page: 1, size: 8 }) });
  const rolesQuery = useQuery({ queryKey: ["admin-roles"], queryFn: getRoles });
  const roles = rolesQuery.data ?? [];
  const users = usersQuery.data?.items ?? [];
  const permissionCount = useMemo(
    () => roles.reduce((total: number, role: any) => total + role.permissions.length, 0),
    [roles]
  );

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      setMessage("Utilisateur cree avec succes.");
      setForm({ nom: "", prenom: "", email: "", login: "", password: "", role_code: "ROLE_COMPTABLE" });
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => setMessage("Impossible de creer cet utilisateur. Verifiez le login et l'email."),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    createMutation.mutate({ ...form, password: form.password || "Passer@123" });
  };

  return (
    <div className="space-y-5 text-[13px]">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700">Administration</p>
          <h2 className="heading mt-1 text-2xl font-extrabold text-[#0b1f33]">Parametres et acces</h2>
          <p className="mt-1 text-sm text-slate-500">Gestion des utilisateurs, roles, permissions et structure scolaire.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-[12px] bg-white/80 px-4 py-2 shadow-sm">
            <p className="heading text-lg font-extrabold text-[#0b1f33]">{usersQuery.data?.total ?? 0}</p>
            <p className="text-[11px] font-bold text-slate-500">Utilisateurs</p>
          </div>
          <div className="rounded-[12px] bg-white/80 px-4 py-2 shadow-sm">
            <p className="heading text-lg font-extrabold text-[#0b1f33]">{roles.length}</p>
            <p className="text-[11px] font-bold text-slate-500">Roles</p>
          </div>
          <div className="rounded-[12px] bg-white/80 px-4 py-2 shadow-sm">
            <p className="heading text-lg font-extrabold text-[#0b1f33]">{permissionCount}</p>
            <p className="text-[11px] font-bold text-slate-500">Droits</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <div className="surface rounded-[14px] p-4" key={module.title}>
            <module.icon className="text-emerald-700" size={20} />
            <h3 className="heading mt-3 text-base font-extrabold text-[#0b1f33]">{module.title}</h3>
            <p className="mt-1 text-[12px] leading-5 text-slate-500">{module.description}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={submit} className="surface rounded-[14px] p-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-emerald-50 text-emerald-700">
              <Plus size={18} />
            </div>
            <div>
              <h3 className="heading text-base font-extrabold text-[#0b1f33]">Nouvel utilisateur</h3>
              <p className="text-[12px] text-slate-500">Attribuez directement un role.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input className="rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-emerald-500" placeholder="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            <input className="rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-emerald-500" placeholder="Prenom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
            <input className="rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-emerald-500 sm:col-span-2" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-emerald-500" placeholder="Login" value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} required />
            <input className="rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-emerald-500" placeholder="Mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select className="rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-emerald-500 sm:col-span-2" value={form.role_code} onChange={(e) => setForm({ ...form, role_code: e.target.value })}>
              {roles.map((role: any) => (
                <option key={role.code} value={role.code}>{roleLabels[role.code] ?? role.nom}</option>
              ))}
            </select>
          </div>
          {message && <p className="mt-3 rounded-[10px] bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-700">{message}</p>}
          <button disabled={createMutation.isPending} className="mt-4 w-full rounded-[10px] bg-[#10242f] px-4 py-2.5 text-[13px] font-extrabold text-white transition hover:bg-[#163747] disabled:opacity-60">
            {createMutation.isPending ? "Creation..." : "Creer l'utilisateur"}
          </button>
        </form>

        <section className="surface rounded-[14px] p-4">
          <h3 className="heading text-base font-extrabold text-[#0b1f33]">Utilisateurs recents</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-[12px]">
              <thead className="text-[11px] uppercase text-slate-500">
                <tr><th className="py-2">Nom</th><th>Login</th><th>Email</th><th>Role</th><th>Statut</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user: any) => (
                  <tr key={user.id}>
                    <td className="py-2 font-bold text-slate-800">{user.nom} {user.prenom}</td>
                    <td>{user.login}</td>
                    <td>{user.email}</td>
                    <td><span className="rounded-full bg-slate-100 px-2 py-1 font-bold text-slate-700">{roleLabels[user.type_utilisateur] ?? user.type_utilisateur}</span></td>
                    <td><span className="rounded-full bg-emerald-50 px-2 py-1 font-bold text-emerald-700">{user.statut}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="surface rounded-[14px] p-4">
        <h3 className="heading text-base font-extrabold text-[#0b1f33]">Roles et permissions</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role: any) => (
            <div key={role.code} className="rounded-[12px] border border-slate-200 bg-white p-3">
              <p className="font-extrabold text-slate-900">{roleLabels[role.code] ?? role.nom}</p>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">{role.permissions.length} permission(s)</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {role.permissions.slice(0, 7).map((permission: string) => (
                  <span key={permission} className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{permission}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
