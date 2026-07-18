import { useQuery } from "@tanstack/react-query";
import { Download, FileSpreadsheet, PieChart, Printer, TrendingUp } from "lucide-react";

import { getReportsOverview } from "../../services/adminService";
import { money, shortDate } from "../../utils/format";
import { printTable } from "../../utils/print";

const reports = [
  "Eleves inscrits",
  "Eleves reinscrits",
  "Tous les paiements",
  "Insolvables",
  "Recherche individuelle",
  "Journalier",
  "Hebdomadaire",
  "Mensuel",
  "Trimestriel",
  "Semestriel",
  "Annuel",
  "Par classe",
  "Par option",
  "Par section",
];

const periods = ["Jour", "Semaine", "Mois", "Trimestre", "Semestre", "Annee scolaire"];

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
  const recentPayments = data?.recent_payments ?? [];
  const maxFee = Math.max(...byFee.map((item: any) => Number(item.montant ?? 0)), 1);

  const exportReport = (report: string) => {
    const rows = [
      "Indicateur;Valeur",
      ...(data?.cards ?? []).map((card: any) => `${card.label};${card.label.toLowerCase().includes("montant") ? money(card.value) : card.value}`),
      "",
      "Paiement;Eleve;Montant;Date",
      ...recentPayments.map((payment: any) => `${payment.reference};${payment.student_name};${money(payment.montant, payment.devise)};${shortDate(payment.date_paiement)}`),
    ];
    exportCsv(report, rows);
  };

  const printReport = (report: string) => {
    printTable(`Rapport - ${report}`, [
      { label: "Reference", value: (payment: any) => payment.reference },
      { label: "Eleve", value: (payment: any) => payment.student_name },
      { label: "Matricule", value: (payment: any) => payment.matricule ?? "-" },
      { label: "Type de frais", value: (payment: any) => payment.fee_type ?? "-" },
      { label: "Montant", value: (payment: any) => money(payment.montant, payment.devise) },
      { label: "Date", value: (payment: any) => shortDate(payment.date_paiement) },
    ], recentPayments);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading text-3xl font-bold text-slate-950">Rapports</h2>
        <p className="mt-1 text-slate-500">Suivi des inscriptions, paiements, recus et recettes pour la direction et la comptabilite.</p>
      </div>

      <section className="surface rounded-[8px] p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <select className="rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600">
            {periods.map((period) => <option key={period}>{period}</option>)}
          </select>
          <input className="rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600" placeholder="Classe ou toutes" />
          <input className="rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600" placeholder="Option" />
          <input className="rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600" placeholder="Section" />
          <input className="rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600" placeholder="Eleve / matricule" />
        </div>
      </section>

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
              <p className="text-sm text-slate-500">Vision utile pour controler les frais les plus payes.</p>
            </div>
            <PieChart className="text-emerald-700" size={20} />
          </div>
          <div className="space-y-3">
            {byFee.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune donnee financiere disponible.</p>
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
              <h3 className="heading text-lg font-bold text-slate-950">Paiements recents</h3>
              <p className="text-sm text-slate-500">Base rapide pour les rapports journaliers et mensuels.</p>
            </div>
            <TrendingUp className="text-emerald-700" size={20} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr><th className="py-3">Reference</th><th>Eleve</th><th>Montant</th><th>Date</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.length === 0 ? (
                  <tr><td className="py-4 text-slate-500" colSpan={4}>Aucun paiement recent.</td></tr>
                ) : (
                  recentPayments.map((payment: any) => (
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
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => exportReport(report)} className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                <Download size={16} /> Exporter
              </button>
              <button type="button" onClick={() => printReport(report)} className="inline-flex items-center gap-2 rounded-[8px] bg-[#102a2b] px-3 py-2 text-sm font-semibold text-white">
                <Printer size={16} /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
