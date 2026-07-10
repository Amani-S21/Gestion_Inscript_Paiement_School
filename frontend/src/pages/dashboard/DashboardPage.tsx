import { useQuery } from "@tanstack/react-query";
import { Banknote, CalendarCheck, GraduationCap, TrendingUp } from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { getDashboard } from "../../services/adminService";
import { money } from "../../utils/format";

export function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });

  if (isLoading) return <div className="text-slate-500">Chargement du tableau de bord...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading text-3xl font-bold text-slate-950">Tableau de bord</h2>
        <p className="mt-1 text-slate-500">Vue rapide sur les inscriptions, paiements et recettes.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total élèves" value={data?.total_eleves ?? 0} icon={GraduationCap} />
        <StatCard label="Nouvelles inscriptions" value={data?.nouvelles_inscriptions ?? 0} icon={CalendarCheck} tone="indigo" />
        <StatCard label="Recettes du jour" value={money(data?.recettes_du_jour)} icon={Banknote} tone="amber" />
        <StatCard label="Recettes annuelles" value={money(data?.recettes_annuelles)} icon={TrendingUp} tone="rose" />
      </div>
      <section className="surface rounded-[8px] p-5">
        <h3 className="heading text-lg font-bold text-slate-950">Activité récente</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[8px] border border-slate-200 bg-white p-4">
            <p className="font-semibold text-slate-800">Paiements récents</p>
            <p className="mt-3 text-sm text-slate-500">Les derniers paiements apparaîtront ici après enregistrement.</p>
          </div>
          <div className="rounded-[8px] border border-slate-200 bg-white p-4">
            <p className="font-semibold text-slate-800">Inscriptions récentes</p>
            <p className="mt-3 text-sm text-slate-500">Les inscriptions et réinscriptions récentes seront listées ici.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
