import { BookPlus, Filter } from "lucide-react";
import { useState } from "react";

export function RegistrationsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="heading text-3xl font-bold text-slate-950">Inscriptions</h2>
          <p className="mt-1 text-slate-500">Nouvelles inscriptions, réinscriptions et changements de classe.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#102a2b] px-4 py-3 font-semibold text-white"
        >
          <BookPlus size={18} />
          Nouvelle inscription
        </button>
      </div>
      {showForm && (
        <form className="surface grid gap-3 rounded-[8px] p-4 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
          <input required className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Matricule de l'élève" />
          <input required className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Année scolaire" />
          <input required className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Classe" />
          <select required className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600">
            <option value="">Type d'inscription</option>
            <option>Nouvelle inscription</option>
            <option>Réinscription</option>
          </select>
          <button className="rounded-[8px] bg-teal-700 px-4 py-2 font-bold text-white sm:col-span-2">Valider l'inscription</button>
        </form>
      )}
      <section className="surface rounded-[8px] p-5">
        <div className="flex items-center gap-2 text-slate-700">
          <Filter size={18} className="text-teal-700" />
          <span className="font-semibold">Filtres par année, classe, option et statut</span>
        </div>
        <p className="mt-4 text-sm text-slate-500">Cette page est prête pour brancher les formulaires et listes d'inscriptions via `/api/registrations`.</p>
      </section>
    </div>
  );
}
