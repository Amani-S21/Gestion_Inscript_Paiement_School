import { useQuery } from "@tanstack/react-query";
import { Download, FileSpreadsheet, PieChart, TrendingUp } from "lucide-react";

import { getReportsOverview } from "../../services/adminService";
import { money, shortDate } from "../../utils/format";

const reports = ["Journalier", "Hebdomadaire", "Mensuel", "Trimestriel", "Annuel", "Par élève", "Par classe", "Par type de frais"];

function exportCsv(report: string, rows: string[]) {
  const content = [`Rapport;${report}`, `Date;${new Date().toLocaleDateString("fr-FR")}`, ...rows].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rapport-${report.toLowerCase().replaceAll(" ", "-")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["reports-overview"], queryFn: getReportsOverview });
  const byFee = data?.by_fee ?? [];
  const maxFee = Math.max(...byFee.map((item: any) => Number(item.montant ?? 0)), 1);

  const exportReport = (report: string) => {
    const rows = [
      "Indicateur;Valeur",
      ...(data?.cards ?? []).map((card: any) => `${card.label};${card.label.toLowerCase().includes("montant") ? money(card.value) : card.value}`),
      "",
      "Paiement;Élève;Montant;Date",
      ...(data?.recent_payments ?? []).map((payment: any) => `${payment.reference};${payment.student_name};${money(payment.montant, payment.devise)};${shortDate(payment.date_paiement)}`),
    ];
    exportCsv(report, rows);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading text-3xl font-bold text-slate-950">Rapports</h2>
        <p className="mt-1 text-slate-500">Suivi des inscriptions, paiements, reçus et recettes pour la direction et la comptabilité.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(data?.cards ?? []).map((card: any) => (
          <div className="surface rounded-[8px] p-5" key={card.label}>
            <p className="text-sm font-semibold text-slate-500">{card.label}</p>
            <p className="heading mt-2 text-2xl font-extrabold text-slate-950">
              {card.label.toLowerCase().includes("montant") ? money(card.value) : card.value}
            </p>
          </div>
        ))}
        {isLoading && <div className="surface rounded-[8px] p-5 text-sm text-slate-500">Chargement des rapports...</div>}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="surface rounded-[8px] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="heading text-lg font-bold text-slate-950">Recettes par type de frais</h3>
              <p className="text-sm text-slate-500">Vision utile pour contrôler les frais les plus payés.</p>
            </div>
            <PieChart className="text-emerald-700" size={20} />
          </div>
          <div className="space-y-3">
            {byFee.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune donnée financière disponible.</p>
            ) : (
              byFee.map((item: any) => {
                const width = Math.max((Number(item.montant ?? 0) / maxFee) * 100, 6);
                return (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>{item.label}</span>
                      <span>{money(item.montant)}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100">
                      <div className="h-2.5 rounded-full bg-emerald-500" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="surface rounded-[8px] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="heading text-lg font-bold text-slate-950">Paiements récents</h3>
              <p className="text-sm text-slate-500">Base rapide pour les rapports journaliers et mensuels.</p>
            </div>
            <TrendingUp className="text-emerald-700" size={20} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr><th className="py-3">Référence</th><th>Élève</th><th>Montant</th><th>Date</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.recent_payments ?? []).length === 0 ? (
                  <tr><td className="py-4 text-slate-500" colSpan={4}>Aucun paiement récent.</td></tr>
                ) : (
                  data.recent_payments.map((payment: any) => (
                    <tr key={payment.id}>
                      <td className="py-3 font-semibold text-slate-800">{payment.reference}</td>
                      <td>{payment.student_name}</td>
                      <td>{money(payment.montant, payment.devise)}</td>
                      <td>{shortDate(payment.date_paiement)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
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
