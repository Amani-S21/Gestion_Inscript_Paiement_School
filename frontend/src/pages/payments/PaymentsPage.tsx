import { useQuery } from "@tanstack/react-query";
import { CreditCard, Printer } from "lucide-react";

import { getPayments } from "../../services/adminService";
import { money, shortDate } from "../../utils/format";

export function PaymentsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["payments"], queryFn: getPayments });
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading text-3xl font-bold text-slate-950">Paiements</h2>
        <p className="mt-1 text-slate-500">Enregistrement controle, historique, recus PDF et soldes automatiques.</p>
      </div>
      <section className="surface rounded-[8px] p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800"><CreditCard size={18} className="text-teal-700" /> Historique</div>
          <button className="grid h-10 w-10 place-items-center rounded-[8px] bg-slate-950 text-white" title="Imprimer"><Printer size={18} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr><th className="py-3">Reference</th><th>Eleve</th><th>Montant</th><th>Statut</th><th>Date</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? <tr><td className="py-4" colSpan={5}>Chargement...</td></tr> : items.map((p: any) => (
                <tr key={p.id}>
                  <td className="py-3 font-semibold">{p.reference}</td>
                  <td>#{p.student_id}</td>
                  <td>{money(p.montant, p.devise)}</td>
                  <td><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{p.statut}</span></td>
                  <td>{shortDate(p.date_paiement)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

