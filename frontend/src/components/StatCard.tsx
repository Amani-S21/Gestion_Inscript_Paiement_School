import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "teal" | "amber" | "indigo" | "rose";
};

const tones = {
  teal: "bg-teal-50 text-teal-700",
  amber: "bg-amber-50 text-amber-700",
  indigo: "bg-indigo-50 text-indigo-700",
  rose: "bg-rose-50 text-rose-700",
};

export function StatCard({ label, value, icon: Icon, tone = "teal" }: Props) {
  return (
    <div className="surface rounded-[8px] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="heading mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-[8px] ${tones[tone]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

