import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "teal" | "amber" | "indigo" | "rose";
};

const tones = {
  teal: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  indigo: "bg-sky-50 text-sky-700 ring-sky-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
};

export function StatCard({ label, value, icon: Icon, tone = "teal" }: Props) {
  return (
    <div className="surface group relative overflow-hidden rounded-[14px] p-5">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/45 blur-2xl transition group-hover:scale-125" />
      <div className="flex items-center justify-between gap-4">
        <div className="relative">
          <p className="text-[13px] font-semibold text-slate-500">{label}</p>
          <p className="heading mt-2 text-2xl font-extrabold text-[#0b1f33]">{value}</p>
        </div>
        <div className={`relative grid h-12 w-12 place-items-center rounded-[12px] ring-1 transition group-hover:scale-105 ${tones[tone]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
