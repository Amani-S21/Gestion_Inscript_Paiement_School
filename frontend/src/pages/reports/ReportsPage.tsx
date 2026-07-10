import { Download, FileSpreadsheet } from "lucide-react";

export function ReportsPage() {
  const reports = ["Journalier", "Hebdomadaire", "Mensuel", "Trimestriel", "Annuel", "Par élève", "Par classe", "Par type de frais"];
  const exportReport = (report: string) => {
    const content = `Rapport;${report}\nDate;${new Date().toLocaleDateString("fr-FR")}\nStatut;Export généré`;
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rapport-${report.toLowerCase().replaceAll(" ", "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading text-3xl font-bold text-slate-950">Rapports</h2>
        <p className="mt-1 text-slate-500">Exports PDF et Excel pour la direction et la comptabilité.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reports.map((report) => (
          <div className="surface rounded-[8px] p-5" key={report}>
            <FileSpreadsheet className="text-teal-700" />
            <p className="mt-4 font-bold text-slate-900">{report}</p>
            <button type="button" onClick={() => exportReport(report)} className="mt-4 inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
              <Download size={16} /> Exporter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
