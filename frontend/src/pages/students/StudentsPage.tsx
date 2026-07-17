import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Pencil, Printer, Power, Search, Trash2, UserPlus, X } from "lucide-react";

import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent,
  updateStudentStatus,
} from "../../services/adminService";
import { Pagination } from "../../components/Pagination";
import { useAuth } from "../../contexts/AuthContext";
import { printTable } from "../../utils/print";

const initialForm = {
  nom: "",
  postnom: "",
  prenom: "",
  email: "",
  login: "",
  password: "",
  telephone: "",
  adresse: "",
  matricule: "",
  sexe: "",
  date_naissance: "",
  lieu_naissance: "",
  nom_tuteur: "",
  telephone_tuteur: "",
};

export function StudentsPage() {
  const queryClient = useQueryClient();
  const { hasRole, hasPermission } = useAuth();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | { title: string; text: string; run: () => void }>(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ["students", q, page], queryFn: () => getStudents({ q, page, size: 10 }) });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const canManageStudents = hasRole("ROLE_ADMIN") || hasPermission("students.manage");
  const canAddStudent = canManageStudents && (hasRole("ROLE_COMPTABLE") || hasRole("ROLE_ADMIN"));
  const canAdminActions = canManageStudents && hasRole("ROLE_ADMIN");

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => setPage(1), [q]);

  const closeModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setForm(initialForm);
    setShowPassword(false);
  };

  const openCreate = () => {
    setEditingStudent(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (student: any) => {
    setEditingStudent(student);
    setForm({
      nom: student.user?.nom ?? "",
      postnom: student.user?.postnom ?? "",
      prenom: student.user?.prenom ?? "",
      email: student.user?.email ?? "",
      login: student.user?.login ?? "",
      password: "",
      telephone: student.user?.telephone ?? "",
      adresse: student.user?.adresse ?? "",
      matricule: student.matricule ?? "",
      sexe: student.sexe ?? "",
      date_naissance: student.date_naissance ?? "",
      lieu_naissance: student.lieu_naissance ?? "",
      nom_tuteur: student.nom_tuteur ?? "",
      telephone_tuteur: student.telephone_tuteur ?? "",
    });
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = Object.fromEntries(
        Object.entries(form).filter(([key, value]) => value !== "" || !["password", "date_naissance"].includes(key)),
      ) as typeof form;
      return editingStudent ? updateStudent(editingStudent.id, payload) : createStudent(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      await queryClient.invalidateQueries({ queryKey: ["students-for-registration"] });
      setConfirmOpen(false);
      closeModal();
      setMessage(editingStudent ? "Élève modifié avec succès." : "Élève ajouté dans le système.");
    },
    onError: () => {
      setConfirmOpen(false);
      setMessage("Action impossible. Vérifiez les informations saisies.");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: "actif" | "inactif" }) => updateStudentStatus(id, statut),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      setConfirmAction(null);
      setMessage("Statut de l'élève mis à jour.");
    },
    onError: () => setMessage("Impossible de modifier le statut de cet élève."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteStudent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      setConfirmAction(null);
      setMessage("Élève supprimé.");
    },
    onError: () => setMessage("Impossible de supprimer cet élève."),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.nom || !form.email || !form.login || !form.matricule || (!editingStudent && !form.password)) {
      setMessage("Renseignez le nom, l'email, le login, le mot de passe et le matricule.");
      return;
    }
    setConfirmOpen(true);
  };

  const printStudents = () => {
    printTable("Liste des élèves", [
      { label: "Matricule", value: (student: any) => student.matricule },
      { label: "Nom", value: (student: any) => `${student.user?.nom ?? ""} ${student.user?.postnom ?? ""} ${student.user?.prenom ?? ""}` },
      { label: "Login", value: (student: any) => student.user?.login },
      { label: "Email", value: (student: any) => student.user?.email },
      { label: "Téléphone", value: (student: any) => student.user?.telephone },
      { label: "Tuteur", value: (student: any) => student.nom_tuteur },
      { label: "Statut", value: (student: any) => student.user?.statut },
    ], items);
  };

  return (
    <div className="space-y-6">
      {message && <div className="fixed right-5 top-20 z-[70] max-w-sm rounded-[14px] border border-emerald-100 bg-white px-4 py-3 text-sm font-bold text-emerald-700 shadow-xl shadow-slate-950/10">{message}</div>}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="heading text-3xl font-bold text-slate-950">Élèves</h2>
          <p className="mt-1 text-slate-500">Ajout des élèves par le comptable et suivi des dossiers du système.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={printStudents} className="grid h-12 w-12 place-items-center rounded-[8px] bg-slate-950 text-white" title="Imprimer"><Printer size={18} /></button>
          {canAddStudent && (
            <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#102a2b] px-4 py-3 font-semibold text-white">
              <UserPlus size={18} />
              Ajouter un élève
            </button>
          )}
        </div>
      </div>

      <div className="surface rounded-[8px] p-4">
        <div className="flex items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-3 py-3">
          <Search size={18} className="text-teal-700" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par nom ou matricule" className="w-full outline-none" />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-3">Matricule</th>
                <th>Nom</th>
                <th>Login</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Tuteur</th>
                <th>Statut</th>
                {canAdminActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td className="py-4 text-slate-500" colSpan={canAdminActions ? 8 : 7}>Chargement...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-4 text-slate-500" colSpan={canAdminActions ? 8 : 7}>Aucun élève trouvé.</td></tr>
              ) : (
                items.map((student: any) => {
                  const isActive = (student.user?.statut ?? "actif") === "actif";
                  return (
                    <tr key={student.id}>
                      <td className="py-3 font-semibold text-slate-900">{student.matricule}</td>
                      <td>{student.user?.nom} {student.user?.postnom} {student.user?.prenom}</td>
                      <td>{student.user?.login ?? "-"}</td>
                      <td>{student.user?.email}</td>
                      <td>{student.user?.telephone ?? "-"}</td>
                      <td>{student.nom_tuteur ?? "-"}</td>
                      <td><span className={`rounded-full px-3 py-1 text-xs font-bold ${isActive ? "bg-teal-50 text-teal-700" : "bg-rose-50 text-rose-700"}`}>{isActive ? "Actif" : "Inactif"}</span></td>
                      {canAdminActions && (
                        <td>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => openEdit(student)} className="grid h-9 w-9 place-items-center rounded-[8px] bg-slate-100 text-slate-700" title="Modifier"><Pencil size={16} /></button>
                            <button
                              type="button"
                              onClick={() => setConfirmAction({
                                title: isActive ? "Désactiver l'élève" : "Activer l'élève",
                                text: isActive ? "Cet élève ne pourra plus se connecter au système." : "Cet élève pourra de nouveau se connecter au système.",
                                run: () => statusMutation.mutate({ id: student.id, statut: isActive ? "inactif" : "actif" }),
                              })}
                              className={`grid h-9 w-9 place-items-center rounded-[8px] ${isActive ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
                              title={isActive ? "Désactiver" : "Activer"}
                            >
                              <Power size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmAction({
                                title: "Supprimer l'élève",
                                text: "Cette action supprimera le dossier élève et son accès utilisateur.",
                                run: () => deleteMutation.mutate(student.id),
                              })}
                              className="grid h-9 w-9 place-items-center rounded-[8px] bg-rose-100 text-rose-700"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} size={10} onPageChange={setPage} />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm">
          <form onSubmit={submit} className="flex h-full w-full flex-col bg-white shadow-2xl shadow-slate-950/20">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="heading text-xl font-extrabold text-slate-950">{editingStudent ? "Modifier l'élève" : "Ajouter un élève"}</h3>
                <p className="text-sm text-slate-500">Le login et le mot de passe permettront à l'élève de se connecter.</p>
              </div>
              <button type="button" onClick={closeModal} className="grid h-9 w-9 place-items-center rounded-[8px] bg-slate-100 text-slate-600"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <input required className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                <input className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Postnom" value={form.postnom} onChange={(e) => setForm({ ...form, postnom: e.target.value })} />
                <input className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
                <input required className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Matricule" value={form.matricule} onChange={(e) => setForm({ ...form, matricule: e.target.value, login: form.login || e.target.value })} />
                <input required type="email" className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input required className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Login" value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} />
                <div className="flex overflow-hidden rounded-[8px] border border-slate-200 focus-within:border-teal-600">
                  <input required={!editingStudent} type={showPassword ? "text" : "password"} className="w-full px-3 py-2 outline-none" placeholder={editingStudent ? "Nouveau mot de passe" : "Mot de passe"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="grid w-11 place-items-center text-slate-500" title={showPassword ? "Masquer" : "Afficher"}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <input className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
                <input className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Adresse" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
                <select className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value })}>
                  <option value="">Sexe</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
                <input type="date" className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" value={form.date_naissance} onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} />
                <input className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Lieu de naissance" value={form.lieu_naissance} onChange={(e) => setForm({ ...form, lieu_naissance: e.target.value })} />
                <input className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Nom du tuteur" value={form.nom_tuteur} onChange={(e) => setForm({ ...form, nom_tuteur: e.target.value })} />
                <input className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Téléphone du tuteur" value={form.telephone_tuteur} onChange={(e) => setForm({ ...form, telephone_tuteur: e.target.value })} />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button type="button" onClick={closeModal} className="rounded-[8px] bg-slate-100 px-4 py-2.5 font-bold text-slate-700">Annuler</button>
              <button type="submit" disabled={saveMutation.isPending} className="rounded-[8px] bg-[#102a2b] px-4 py-2.5 font-bold text-white disabled:opacity-60">
                {saveMutation.isPending ? "Enregistrement..." : editingStudent ? "Modifier" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 px-3 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[18px] bg-white p-5 shadow-2xl shadow-slate-950/20">
            <h3 className="heading text-lg font-extrabold text-slate-950">{editingStudent ? "Confirmer la modification" : "Confirmer l'ajout"}</h3>
            <p className="mt-2 text-sm text-slate-600">{editingStudent ? "Voulez-vous modifier les informations de cet élève ?" : "Voulez-vous ajouter cet élève dans le système ?"}</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmOpen(false)} className="rounded-[8px] bg-slate-100 px-4 py-2.5 font-bold text-slate-700">Annuler</button>
              <button type="button" onClick={() => saveMutation.mutate()} className="rounded-[8px] bg-[#102a2b] px-4 py-2.5 font-bold text-white">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 px-3 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[18px] bg-white p-5 shadow-2xl shadow-slate-950/20">
            <h3 className="heading text-lg font-extrabold text-slate-950">{confirmAction.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{confirmAction.text}</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmAction(null)} className="rounded-[8px] bg-slate-100 px-4 py-2.5 font-bold text-slate-700">Annuler</button>
              <button type="button" onClick={confirmAction.run} className="rounded-[8px] bg-[#102a2b] px-4 py-2.5 font-bold text-white">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
