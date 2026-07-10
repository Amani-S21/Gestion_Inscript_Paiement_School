import { useQuery } from "@tanstack/react-query";
import { Search, UserPlus } from "lucide-react";
import { useState } from "react";

import { getStudents } from "../../services/adminService";

export function StudentsPage() {
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ["students", q], queryFn: () => getStudents({ q, page: 1, size: 20 }) });
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="heading text-3xl font-bold text-slate-950">Élèves</h2>
          <p className="mt-1 text-slate-500">Recherche, import, export et gestion des dossiers.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#102a2b] px-4 py-3 font-semibold text-white"
        >
          <UserPlus size={18} />
          Ajouter
        </button>
      </div>
      {showForm && (
        <form className="surface grid gap-3 rounded-[8px] p-4 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
          <input required className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Nom" />
          <input required className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Prénom" />
          <input required className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Matricule" />
          <input className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Téléphone" />
          <button className="rounded-[8px] bg-teal-700 px-4 py-2 font-bold text-white sm:col-span-2">Enregistrer l'élève</button>
        </form>
      )}
      <div className="surface rounded-[8px] p-4">
        <div className="flex items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-3 py-3">
          <Search size={18} className="text-teal-700" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par nom ou matricule" className="w-full outline-none" />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-3">Matricule</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td className="py-4 text-slate-500" colSpan={5}>Chargement...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-4 text-slate-500" colSpan={5}>Aucun élève trouvé.</td></tr>
              ) : (
                items.map((student: any) => (
                  <tr key={student.id}>
                    <td className="py-3 font-semibold text-slate-900">{student.matricule}</td>
                    <td>{student.user?.nom} {student.user?.prenom}</td>
                    <td>{student.user?.email}</td>
                    <td>{student.user?.telephone ?? "-"}</td>
                    <td><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">Actif</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
