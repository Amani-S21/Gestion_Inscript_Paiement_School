import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Bell, CreditCard, Download, IdCard, ReceiptText, UserRound } from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { cardPdfUrl, getStudentDashboard, receiptPdfUrl } from "../../services/studentSpaceService";
import { money, shortDate } from "../../utils/format";

export function StudentSpacePage() {
  const { data, isLoading } = useQuery({ queryKey: ["student-dashboard"], queryFn: getStudentDashboard });

  if (isLoading) return <div className="text-slate-500">Chargement de votre espace...</div>;
  if (!data) return <div className="text-slate-500">Aucune information eleve disponible.</div>;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[8px] bg-[#102a2b] text-white shadow-2xl shadow-teal-950/10">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[8px] bg-teal-300 text-[#102a2b]">
              {data.profile.photo_url ? <img src={data.profile.photo_url} className="h-full w-full object-cover" /> : <UserRound size={42} />}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-100">Espace eleve</p>
              <h2 className="heading mt-2 text-3xl font-extrabold">{data.profile.nom_complet}</h2>
              <p className="mt-2 text-teal-50">
                {data.classe ?? "Classe non renseignee"} - {data.option ?? "Option non renseignee"} - {data.annee_scolaire ?? "Annee non renseignee"}
              </p>
              <p className="mt-1 text-sm text-teal-100">Matricule: {data.profile.matricule}</p>
            </div>
          </div>
          <a href={cardPdfUrl()} className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-teal-300 px-4 font-bold text-[#102a2b]">
            <IdCard size={18} /> Carte PDF
          </a>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Paiements" value={data.total_paiements} icon={CreditCard} />
        <StatCard label="Total frais" value={money(data.montant_total_frais)} icon={ReceiptText} tone="indigo" />
        <StatCard label="Total paye" value={money(data.montant_total_paye)} icon={BadgeCheck} tone="amber" />
        <StatCard label="Solde restant" value={money(data.solde_restant)} icon={CreditCard} tone="rose" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="surface rounded-[8px] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="heading text-xl font-bold text-slate-950">Derniers recus</h3>
              <p className="text-sm text-slate-500">Dernier paiement: {shortDate(data.dernier_paiement)}</p>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{data.etat_frais.replace("_", " ")}</span>
          </div>
          <div className="mt-4 space-y-3">
            {data.derniers_recus.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun recu disponible.</p>
            ) : (
              data.derniers_recus.map((receipt) => (
                <div key={receipt.id} className="flex items-center justify-between gap-3 rounded-[8px] border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-3">
                    <ReceiptText className="text-teal-700" size={20} />
                    <span className="font-semibold text-slate-800">{receipt.numero}</span>
                  </div>
                  <a href={receiptPdfUrl(receipt.id)} className="grid h-9 w-9 place-items-center rounded-[8px] bg-slate-950 text-white" title="Telecharger le recu">
                    <Download size={16} />
                  </a>
                </div>
              ))
            )}
          </div>
        </section>
        <section className="surface rounded-[8px] p-5">
          <h3 className="heading flex items-center gap-2 text-xl font-bold text-slate-950"><Bell className="text-teal-700" /> Notifications</h3>
          <div className="mt-4 space-y-3">
            {data.notifications.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune notification recente.</p>
            ) : (
              data.notifications.map((item) => (
                <div key={item.id} className="rounded-[8px] border border-slate-200 bg-white p-3">
                  <p className="font-semibold text-slate-900">{item.titre}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.message}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

