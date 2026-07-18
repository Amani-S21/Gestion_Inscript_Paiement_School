import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Bell, CreditCard, Download, IdCard, ReceiptText, UserRound } from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { downloadStudentCardPdf, downloadStudentReceiptPdf, getStudentDashboard } from "../../services/studentSpaceService";
import { money, shortDate } from "../../utils/format";
import { printTable } from "../../utils/print";

export function StudentSpacePage() {
  const { data, isLoading } = useQuery({ queryKey: ["student-dashboard"], queryFn: getStudentDashboard });

  if (isLoading) return <div className="text-slate-500">Chargement de votre espace...</div>;
  if (!data) return <div className="text-slate-500">Aucune information élève disponible.</div>;

  const printRegistrationForm = () => {
    printTable("Formulaire d'inscription valide", [
      { label: "Champ", value: (row: any) => row.label },
      { label: "Information", value: (row: any) => row.value },
    ], [
      { label: "Nom complet", value: data.profile.nom_complet },
      { label: "Matricule", value: data.profile.matricule },
      { label: "Classe", value: data.classe ?? "Non renseignée" },
      { label: "Option", value: data.option ?? "Non renseignée" },
      { label: "Année scolaire", value: data.annee_scolaire ?? "Non renseignée" },
      { label: "Date de naissance", value: shortDate(data.profile.date_naissance) },
      { label: "Lieu de naissance", value: data.profile.lieu_naissance ?? "-" },
      { label: "Tuteur", value: data.profile.nom_tuteur ?? "-" },
      { label: "Téléphone tuteur", value: data.profile.telephone_tuteur ?? "-" },
    ]);
  };

  const downloadCard = async () => {
    await downloadStudentCardPdf(`carte-${data.profile.matricule}.pdf`);
  };

  const downloadReceipt = async (receipt: { id: number; numero: string }) => {
    await downloadStudentReceiptPdf(receipt.id, `recu-${receipt.numero}.pdf`);
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[8px] bg-[#102a2b] text-white shadow-2xl shadow-teal-950/10">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[8px] bg-teal-300 text-[#102a2b]">
              {data.profile.photo_url ? <img src={data.profile.photo_url} className="h-full w-full object-cover" /> : <UserRound size={42} />}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-100">Espace élève</p>
              <h2 className="heading mt-2 text-3xl font-extrabold">{data.profile.nom_complet}</h2>
              <p className="mt-2 text-teal-50">
                {data.classe ?? "Classe non renseignée"} - {data.option ?? "Option non renseignée"} - {data.annee_scolaire ?? "Année non renseignée"}
              </p>
              <p className="mt-1 text-sm text-teal-100">Matricule: {data.profile.matricule}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => void downloadCard()} className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-teal-300 px-4 font-bold text-[#102a2b]">
              <IdCard size={18} /> Carte PDF
            </button>
            <button type="button" onClick={printRegistrationForm} className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-white/10 px-4 font-bold text-white">
              <Download size={18} /> Formulaire
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Paiements" value={data.total_paiements} icon={CreditCard} />
        <StatCard label="Total frais" value={money(data.montant_total_frais)} icon={ReceiptText} tone="indigo" />
        <StatCard label="Total payé" value={money(data.montant_total_paye)} icon={BadgeCheck} tone="amber" />
        <StatCard label="Solde restant" value={money(data.solde_restant)} icon={CreditCard} tone="rose" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="surface rounded-[8px] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="heading text-xl font-bold text-slate-950">Derniers reçus</h3>
              <p className="text-sm text-slate-500">Dernier paiement: {shortDate(data.dernier_paiement)}</p>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{data.etat_frais.replace("_", " ")}</span>
          </div>
          <div className="mt-4 space-y-3">
            {data.derniers_recus.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun reçu disponible.</p>
            ) : (
              data.derniers_recus.map((receipt) => (
                <div key={receipt.id} className="flex items-center justify-between gap-3 rounded-[8px] border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-3">
                    <ReceiptText className="text-teal-700" size={20} />
                    <span className="font-semibold text-slate-800">{receipt.numero}</span>
                  </div>
                  <button type="button" onClick={() => void downloadReceipt(receipt)} className="grid h-9 w-9 place-items-center rounded-[8px] bg-slate-950 text-white" title="Télécharger le reçu">
                    <Download size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
        <section className="surface rounded-[8px] p-5">
          <h3 className="heading flex items-center gap-2 text-xl font-bold text-slate-950"><Bell className="text-teal-700" /> Notifications</h3>
          <div className="mt-4 space-y-3">
            {data.notifications.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune notification récente.</p>
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
