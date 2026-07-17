import { useQuery } from "@tanstack/react-query";
import { Children, type ReactNode } from "react";
import {
  Banknote,
  BellRing,
  CalendarCheck,
  FileText,
  FileQuestion,
  GraduationCap,
  Layers3,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import { StatCard } from "../../components/StatCard";
import { getDashboard } from "../../services/adminService";
import { money, shortDate } from "../../utils/format";
import { useAuth } from "../../contexts/AuthContext";

type ChartItem = {
  label: string;
  montant?: string | number;
  value?: number;
};

const chartColors = ["#10b981", "#0ea5e9", "#f59e0b", "#e11d48", "#6366f1", "#14b8a6"];

function valueOf(item: ChartItem, valueKey: "montant" | "value") {
  return Number(item[valueKey] ?? 0);
}

function BarChart({ items, valueKey = "montant", compact = false }: { items: ChartItem[]; valueKey?: "montant" | "value"; compact?: boolean }) {
  const values = items.map((item) => valueOf(item, valueKey));
  const max = Math.max(...values, 1);

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune donnée disponible.</p>
      ) : (
        items.map((item, index) => {
          const rawValue = valueOf(item, valueKey);
          const width = Math.max((rawValue / max) * 100, rawValue > 0 ? 8 : 2);
          return (
            <div key={`${item.label}-${index}`}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs font-bold text-slate-600">
                <span className="truncate">{item.label}</span>
                <span>{valueKey === "montant" ? money(rawValue) : rawValue}</span>
              </div>
              <div className={compact ? "h-2 rounded-full bg-slate-100" : "h-2.5 rounded-full bg-slate-100"}>
                <div className={`${compact ? "h-2" : "h-2.5"} rounded-full bg-emerald-500 transition-all`} style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function ColumnChart({ items }: { items: ChartItem[] }) {
  const max = Math.max(...items.map((item) => Number(item.montant ?? 0)), 1);

  return (
    <div className="flex h-56 items-end gap-3 border-b border-slate-200 pb-2">
      {items.length === 0 ? (
        <p className="self-center text-sm text-slate-500">Aucune donnée disponible.</p>
      ) : (
        items.map((item) => {
          const amount = Number(item.montant ?? 0);
          const height = Math.max((amount / max) * 100, amount > 0 ? 8 : 3);
          return (
            <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-44 w-full items-end rounded-t-[8px] bg-slate-50 px-1">
                <div className="w-full rounded-t-[8px] bg-emerald-500 shadow-sm shadow-emerald-950/10" style={{ height: `${height}%` }} title={money(amount)} />
              </div>
              <span className="w-full truncate text-center text-[11px] font-bold text-slate-500">{item.label}</span>
            </div>
          );
        })
      )}
    </div>
  );
}

function DonutChart({ items, centerLabel }: { items: ChartItem[]; centerLabel: string }) {
  const total = items.reduce((sum, item) => sum + Number(item.value ?? item.montant ?? 0), 0);
  let cursor = 0;
  const segments = items.length
    ? items
        .map((item, index) => {
          const value = Number(item.value ?? item.montant ?? 0);
          const start = cursor;
          const degrees = total > 0 ? (value / total) * 360 : 0;
          cursor += degrees;
          return `${chartColors[index % chartColors.length]} ${start}deg ${cursor}deg`;
        })
        .join(", ")
    : "#e2e8f0 0deg 360deg";

  return (
    <div className="flex items-center gap-5">
      <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${segments})` }}>
        <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center">
          <span className="text-lg font-extrabold text-slate-950">{total}</span>
          <span className="-mt-2 text-[10px] font-bold uppercase text-slate-400">{centerLabel}</span>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune donnée disponible.</p>
        ) : (
          items.map((item, index) => (
            <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-700">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="font-bold text-slate-900">{Number(item.value ?? item.montant ?? 0)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ActivityList({ title, empty, children }: { title: string; empty: string; children: ReactNode }) {
  const hasItems = Children.count(children) > 0;

  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-4">
      <p className="font-semibold text-slate-800">{title}</p>
      <div className="mt-3 space-y-3">{hasItems ? children : <p className="text-sm text-slate-500">{empty}</p>}</div>
    </div>
  );
}

export function DashboardPage() {
  const { hasRole } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });

  if (isLoading) return <div className="text-slate-500">Chargement du tableau de bord...</div>;

  const isAdmin = hasRole("ROLE_ADMIN");
  const isComptable = hasRole("ROLE_COMPTABLE");
  const isSecretaire = hasRole("ROLE_SECRETAIRE");
  const isPrefet = hasRole("ROLE_PREFET");
  const isDirection = hasRole("ROLE_DIRECTION");
  const isStudent = hasRole("ROLE_ELEVE");
  const title = isAdmin
    ? "Tableau de bord administrateur"
    : isComptable
      ? "Tableau de bord comptable"
      : isSecretaire
        ? "Tableau de bord secrétariat"
        : isPrefet
          ? "Tableau de bord préfet"
          : isDirection
            ? "Tableau de bord direction"
            : isStudent
              ? "Mon tableau de bord"
              : "Tableau de bord";
  const subtitle = isAdmin
    ? "Vue globale du système, des inscriptions, des paiements, des utilisateurs, des reçus et des rapports."
    : isComptable
      ? "Vue centrée sur les paiements, les reçus, les frais et les recettes."
      : isSecretaire
        ? "Vue centrée sur les élèves, les inscriptions et l'activité récente."
        : isPrefet
          ? "Suivi pédagogique des élèves, inscriptions, classes, sections et options."
          : isDirection
            ? "Lecture synthétique des effectifs, recettes, reçus et activités."
            : isStudent
              ? "Vue rapide sur votre espace élève."
              : "Vue rapide sur les inscriptions, paiements et recettes.";

  const stats = [
    { key: "students", label: "Total élèves", value: data?.total_eleves ?? 0, icon: GraduationCap },
    { key: "registrations", label: "Nouvelles inscriptions", value: data?.nouvelles_inscriptions ?? 0, icon: CalendarCheck, tone: "indigo" as const },
    { key: "daily", label: "Recettes du jour", value: money(data?.recettes_du_jour), icon: Banknote, tone: "amber" as const },
    { key: "yearly", label: "Recettes annuelles", value: money(data?.recettes_annuelles), icon: TrendingUp, tone: "rose" as const },
    { key: "users", label: "Utilisateurs actifs", value: data?.utilisateurs_actifs ?? 0, icon: UsersRound, tone: "teal" as const },
    { key: "receipts", label: "Reçus générés", value: data?.recus_generes ?? 0, icon: ReceiptText, tone: "indigo" as const },
    { key: "payments", label: "Paiements", value: data?.total_paiements ?? 0, icon: FileText, tone: "amber" as const },
    { key: "fees", label: "Frais configurés", value: money(data?.total_frais_configures), icon: ShieldCheck, tone: "teal" as const },
    { key: "claims", label: "Réclamations ouvertes", value: data?.reclamations_ouvertes ?? 0, icon: FileQuestion, tone: "rose" as const },
  ];
  const visibleStats = isComptable
    ? stats.filter((stat) => ["daily", "yearly", "receipts", "payments", "fees", "claims"].includes(stat.key))
    : isSecretaire
      ? stats.filter((stat) => ["students", "registrations"].includes(stat.key))
      : isStudent
        ? stats.filter((stat) => stat.key === "registrations")
        : stats;

  return (
    <div className="space-y-6">
      <div>
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-emerald-700">{data?.annee_active ? `Année active : ${data.annee_active}` : "Vue système"}</p>
          <h2 className="heading text-3xl font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visibleStats.map((stat) => (
          <StatCard key={stat.key} label={stat.label} value={stat.value} icon={stat.icon} tone={stat.tone} />
        ))}
      </div>

      {(isAdmin || isDirection || isComptable || isPrefet) && (
        <div className="grid gap-4 xl:grid-cols-[1.45fr_0.9fr]">
          <section className="surface rounded-[8px] p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="heading text-lg font-bold text-slate-950">Évolution des recettes</h3>
                <p className="text-sm text-slate-500">Encaissements mensuels de l'année en cours.</p>
              </div>
              <TrendingUp className="text-emerald-700" size={20} />
            </div>
            <ColumnChart items={data?.recettes_mensuelles_chart ?? []} />
          </section>

          <section className="surface rounded-[8px] p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="heading text-lg font-bold text-slate-950">Inscriptions</h3>
                <p className="text-sm text-slate-500">Nouvelles inscriptions et réinscriptions.</p>
              </div>
              <ShieldCheck className="text-emerald-700" size={20} />
            </div>
            <DonutChart items={data?.inscriptions_chart ?? []} centerLabel="dossiers" />
          </section>
        </div>
      )}

      {isAdmin && (
        <div className="grid gap-4 xl:grid-cols-3">
          <section className="surface rounded-[8px] p-5">
            <h3 className="heading text-lg font-bold text-slate-950">Recettes des 7 derniers jours</h3>
            <p className="mb-5 text-sm text-slate-500">Suivi court pour repérer les journées fortes.</p>
            <BarChart items={data?.recettes_journalieres_chart ?? []} compact />
          </section>

          <section className="surface rounded-[8px] p-5">
            <h3 className="heading text-lg font-bold text-slate-950">Structure scolaire</h3>
            <p className="mb-5 text-sm text-slate-500">Sections, options, classes et années configurées.</p>
            <DonutChart items={data?.structure_chart ?? []} centerLabel="éléments" />
          </section>

          <section className="surface rounded-[8px] p-5">
            <h3 className="heading text-lg font-bold text-slate-950">Utilisateurs</h3>
            <p className="mb-5 text-sm text-slate-500">État des comptes qui accèdent au système.</p>
            <DonutChart items={data?.utilisateurs_chart ?? []} centerLabel="comptes" />
          </section>
        </div>
      )}

      {(isAdmin || isDirection || isComptable || isPrefet) && (
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="surface rounded-[8px] p-5">
            <h3 className="heading text-lg font-bold text-slate-950">Répartition par type de frais</h3>
            <p className="mb-5 text-sm text-slate-500">Les frais qui alimentent le plus les recettes.</p>
            <BarChart items={data?.frais_chart ?? []} />
          </section>

          <section className="surface rounded-[8px] p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="heading text-lg font-bold text-slate-950">Notifications publiées</h3>
                <p className="text-sm text-slate-500">Dernières annonces envoyées aux utilisateurs concernés.</p>
              </div>
              <BellRing className="text-emerald-700" size={20} />
            </div>
            <div className="space-y-3">
              {(data?.notifications ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">Aucune notification publiée.</p>
              ) : (
                data.notifications.map((item: any) => (
                  <div key={item.id} className="rounded-[8px] border border-slate-200 bg-white p-3">
                    <p className="font-bold text-slate-900">{item.titre}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.contenu}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {isAdmin && (
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <section className="surface rounded-[8px] p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="heading text-lg font-bold text-slate-950">Rôles et accès</h3>
                <p className="text-sm text-slate-500">Répartition des comptes par rôle.</p>
              </div>
              <UsersRound className="text-emerald-700" size={20} />
            </div>
            <BarChart items={data?.roles_chart ?? []} valueKey="value" />
          </section>

          <section className="surface rounded-[8px] p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="heading text-lg font-bold text-slate-950">Paiements par statut</h3>
                <p className="text-sm text-slate-500">Contrôle rapide des paiements enregistrés.</p>
              </div>
              <Layers3 className="text-emerald-700" size={20} />
            </div>
            <DonutChart items={data?.paiements_statut_chart ?? []} centerLabel="paiements" />
          </section>
        </div>
      )}

      <section className="surface rounded-[8px] p-5">
        <h3 className="heading text-lg font-bold text-slate-950">Activité récente</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ActivityList title="Paiements récents" empty="Les derniers paiements apparaîtront ici après enregistrement.">
            {(data?.paiements_recents ?? []).map((payment: any) => (
              <div key={payment.id} className="flex items-center justify-between gap-3 rounded-[8px] bg-slate-50 px-3 py-2 text-sm">
                <div>
                  <p className="font-bold text-slate-800">{payment.student_name}</p>
                  <p className="text-xs text-slate-500">{payment.reference}</p>
                </div>
                <span className="font-extrabold text-emerald-700">{money(payment.montant, payment.devise)}</span>
              </div>
            ))}
          </ActivityList>

          <ActivityList title="Inscriptions récentes" empty="Les inscriptions et réinscriptions récentes seront listées ici.">
            {(data?.inscriptions_recentes ?? []).map((registration: any) => (
              <div key={registration.id} className="flex items-center justify-between gap-3 rounded-[8px] bg-slate-50 px-3 py-2 text-sm">
                <div>
                  <p className="font-bold text-slate-800">{registration.student_name}</p>
                  <p className="text-xs text-slate-500">{registration.classe ?? "Classe non renseignée"}</p>
                </div>
                <span className="text-xs font-bold text-slate-500">{shortDate(registration.date_inscription)}</span>
              </div>
            ))}
          </ActivityList>
        </div>
      </section>
    </div>
  );
}
