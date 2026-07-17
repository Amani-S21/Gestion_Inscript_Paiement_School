import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, FileText, Plus, Printer, X } from "lucide-react";

import { createPayment, downloadReceiptPdf, getFees, getPayments, getStudents } from "../../services/adminService";
import { Pagination } from "../../components/Pagination";
import { useAuth } from "../../contexts/AuthContext";
import { money, shortDate } from "../../utils/format";
import { printTable } from "../../utils/print";

const initialForm = { student_id: "", fee_id: "", montant: "", devise: "USD" };

export function PaymentsPage() {
  const queryClient = useQueryClient();
  const { hasRole, hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ["payments", page], queryFn: () => getPayments({ page, size: 10 }) });
  const studentsQuery = useQuery({ queryKey: ["students-for-payment"], queryFn: () => getStudents({ page: 1, size: 100 }) });
  const feesQuery = useQuery({ queryKey: ["fees"], queryFn: getFees });
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const students = studentsQuery.data?.items ?? [];
  const fees = feesQuery.data ?? [];
  const selectedFee = fees.find((fee: any) => String(fee.id) === form.fee_id);
  const canCreatePayment = hasRole("ROLE_COMPTABLE") && hasPermission("payments.manage");

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const printPage = () => {
    printTable("Liste des paiements", [
      { label: "Référence", value: (payment: any) => payment.reference },
      { label: "Élève", value: (payment: any) => payment.student_name },
      { label: "Type de frais", value: (payment: any) => payment.fee_type },
      { label: "Montant", value: (payment: any) => money(payment.montant, payment.devise) },
      { label: "Statut", value: (payment: any) => payment.statut },
      { label: "Date", value: (payment: any) => shortDate(payment.date_paiement) },
      { label: "Reçu", value: (payment: any) => payment.receipt?.numero },
    ], items);
  };

  const mutation = useMutation({
    mutationFn: () =>
      createPayment({
        student_id: Number(form.student_id),
        fee_id: Number(form.fee_id),
        montant: form.montant,
        devise: selectedFee?.devise ?? form.devise,
      }),
    onSuccess: async (payment: any) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["payments"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      setShowModal(false);
      setConfirmOpen(false);
      setForm(initialForm);
      setMessage("Paiement enregistré et reçu généré.");
      if (payment?.id) {
        await downloadReceiptPdf(payment.id, `recu-${payment.receipt?.numero ?? payment.reference}.pdf`);
      }
    },
    onError: () => {
      setConfirmOpen(false);
      setMessage("Impossible d'enregistrer ce paiement.");
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.student_id || !form.fee_id || !form.montant) {
      setMessage("Sélectionnez l'élève, le frais et le montant.");
      return;
    }
    setConfirmOpen(true);
  };

  const downloadReceipt = async (payment: any) => {
    setMessage("");
    try {
      await downloadReceiptPdf(payment.id, `recu-${payment.receipt?.numero ?? payment.reference}.pdf`);
      setMessage("Reçu de paiement généré avec succès.");
    } catch {
      setMessage("Impossible de générer le reçu pour ce paiement.");
    }
  };

  return (
    <div className="space-y-6">
      {message && <div className="fixed right-5 top-20 z-[70] max-w-sm rounded-[14px] border border-emerald-100 bg-white px-4 py-3 text-sm font-bold text-emerald-700 shadow-xl shadow-slate-950/10">{message}</div>}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="heading text-3xl font-bold text-slate-950">Paiements</h2>
          <p className="mt-1 text-slate-500">Enregistrement contrôlé, historique, reçus PDF et soldes automatiques.</p>
        </div>
        {canCreatePayment && (
          <button type="button" onClick={() => setShowModal(true)} className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#102a2b] px-4 py-3 font-semibold text-white">
            <Plus size={18} />
            Enregistrer un paiement
          </button>
        )}
      </div>

      <section className="surface rounded-[8px] p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800"><CreditCard size={18} className="text-teal-700" /> Historique</div>
          <button type="button" onClick={printPage} className="grid h-10 w-10 place-items-center rounded-[8px] bg-slate-950 text-white" title="Imprimer"><Printer size={18} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr><th className="py-3">Référence</th><th>Élève</th><th>Type de frais</th><th>Montant</th><th>Statut</th><th>Date</th><th>Reçu</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? <tr><td className="py-4" colSpan={7}>Chargement...</td></tr> : items.map((p: any) => (
                <tr key={p.id}>
                  <td className="py-3 font-semibold">{p.reference}</td>
                  <td>{p.student_name ?? `#${p.student_id}`}</td>
                  <td>{p.fee_type ?? "Frais scolaire"}</td>
                  <td>{money(p.montant, p.devise)}</td>
                  <td><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{p.statut}</span></td>
                  <td>{shortDate(p.date_paiement)}</td>
                  <td>
                    <button type="button" onClick={() => void downloadReceipt(p)} className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">
                      <FileText size={15} /> Reçu
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && items.length === 0 && <tr><td className="py-4 text-slate-500" colSpan={7}>Aucun paiement enregistré.</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} size={10} onPageChange={setPage} />
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-3 py-6 backdrop-blur-sm">
          <form onSubmit={submit} className="w-full max-w-2xl rounded-[18px] bg-white p-5 shadow-2xl shadow-slate-950/20">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="heading text-xl font-extrabold text-slate-950">Enregistrer un paiement</h3>
                <p className="text-sm text-slate-500">Le reçu PDF sera généré automatiquement après validation.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="grid h-9 w-9 place-items-center rounded-[8px] bg-slate-100 text-slate-600"><X size={18} /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select required className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600 sm:col-span-2" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
                <option value="">Sélectionnez l'élève</option>
                {students.map((student: any) => <option key={student.id} value={student.id}>{student.matricule} - {student.user?.nom} {student.user?.prenom}</option>)}
              </select>
              <select required className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" value={form.fee_id} onChange={(e) => {
                const fee = fees.find((item: any) => String(item.id) === e.target.value);
                setForm({ ...form, fee_id: e.target.value, montant: String(fee?.montant ?? ""), devise: fee?.devise ?? "USD" });
              }}>
                <option value="">Type de frais</option>
                {fees.map((fee: any) => <option key={fee.id} value={fee.id}>{fee.fee_type} - {money(fee.montant, fee.devise)}</option>)}
              </select>
              <input required className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Montant" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-[8px] bg-slate-100 px-4 py-2.5 font-bold text-slate-700">Annuler</button>
              <button type="submit" disabled={mutation.isPending} className="rounded-[8px] bg-[#102a2b] px-4 py-2.5 font-bold text-white disabled:opacity-60">
                {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 px-3 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[18px] bg-white p-5 shadow-2xl shadow-slate-950/20">
            <h3 className="heading text-lg font-extrabold text-slate-950">Confirmer le paiement</h3>
            <p className="mt-2 text-sm text-slate-600">Voulez-vous enregistrer ce paiement et générer son reçu ?</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmOpen(false)} className="rounded-[8px] bg-slate-100 px-4 py-2.5 font-bold text-slate-700">Annuler</button>
              <button type="button" onClick={() => mutation.mutate()} className="rounded-[8px] bg-[#102a2b] px-4 py-2.5 font-bold text-white">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
