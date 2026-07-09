import { BookPlus, Filter } from "lucide-react";

export function RegistrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="heading text-3xl font-bold text-slate-950">Inscriptions</h2>
          <p className="mt-1 text-slate-500">Nouvelles inscriptions, reinscriptions et changements de classe.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#102a2b] px-4 py-3 font-semibold text-white">
          <BookPlus size={18} />
          Nouvelle inscription
        </button>
      </div>
      <section className="surface rounded-[8px] p-5">
        <div className="flex items-center gap-2 text-slate-700">
          <Filter size={18} className="text-teal-700" />
          <span className="font-semibold">Filtres par annee, classe, option et statut</span>
        </div>
        <p className="mt-4 text-sm text-slate-500">Cette page est prete pour brancher les formulaires et listes d'inscriptions via `/api/registrations`.</p>
      </section>
    </div>
  );
}

