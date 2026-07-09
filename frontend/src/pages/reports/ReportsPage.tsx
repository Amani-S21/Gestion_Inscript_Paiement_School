import { Download, FileSpreadsheet } from "lucide-react";

export function ReportsPage() {
  const reports = ["Journalier", "Hebdomadaire", "Mensuel", "Trimestriel", "Annuel", "Par eleve", "Par classe", "Par type de frais"];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading text-3xl font-bold text-slate-950">Rapports</h2>
        <p className="mt-1 text-slate-500">Exports PDF et Excel pour la direction et la comptabilite.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reports.map((report) => (
          <div className="surface rounded-[8px] p-5" key={report}>
            <FileSpreadsheet className="text-teal-700" />
            <p className="mt-4 font-bold text-slate-900">{report}</p>
            <button className="mt-4 inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
              <Download size={16} /> Exporter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

