import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, FileQuestion, Plus, Printer, X } from "lucide-react";

import { createReclamation, getReclamations, updateReclamation } from "../../services/adminService";
import { Pagination } from "../../components/Pagination";
import { useAuth } from "../../contexts/AuthContext";
import { money, shortDate } from "../../utils/format";
import { printTable } from "../../utils/print";

const initialForm = { subject: "", message: "" };

export function ReclamationsPage() {
  const queryClient = useQueryClient();
  const { hasRole, hasPermission } = useAuth();
  const isStudent = hasRole("ROLE_ELEVE");
  const canManage = hasRole("ROLE_ADMIN") || hasPermission("reclamations.manage");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [confirmCreate, setConfirmCreate] = useState(false);
  const [confirmResolve, setConfirmResolve] = useState<null | { id: number; response: string }>(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(initialForm);
  const [responseById, setResponseById] = useState<Record<string, string>>({});
  const { data, isLoading } = useQuery({ queryKey: ["reclamations", page], queryFn: () => getReclamations({ page, size: 10 }) });
  const rows = data?.items ?? [];
  const total = data?.total ?? 0;

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const createMutation = useMutation({
    mutationFn: () => createReclamation({ subject: form.subject, message: form.message }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reclamations"] });
      setForm(initialForm);
      setShowModal(false);
      setConfirmCreate(false);
      setMessage("Réclamation envoyée avec succès.");
    },
    onError: () => {
      setConfirmCreate(false);
      setMessage("Impossible d'envoyer cette réclamation.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, response }: { id: number; response: string }) => updateReclamation(id, { status: "resolved", response }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reclamations"] });
      setConfirmResolve(null);
      setMessage("Réclamation traitée.");
    },
    onError: () => {
      setConfirmResolve(null);
      setMessage("Impossible de traiter cette réclamation.");
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.subject || !form.message) {
      setMessage("Renseignez l'objet et le message.");
      return;
    }
    setConfirmCreate(true);
  };

  const printReclamations = () => {
    printTable("Liste des réclamations", [
      { label: "Élève", value: (row: any) => row.student_name },
      { label: "Objet", value: (row: any) => row.subject },
      { label: "Paiement", value: (row: any) => row.payment_reference ? `${row.payment_reference} - ${money(row.payment_amount, row.payment_currency)}` : "-" },
      { label: "Message", value: (row: any) => row.message },
      { label: "Réponse", value: (row: any) => row.response },
      { label: "Date", value: (row: any) => shortDate(row.created_at) },
      { label: "Statut", value: (row: any) => row.status === "resolved" ? "Résolue" : "En cours" },
    ], rows);
  };

  return (
    <div className="space-y-6">
      {message && <div className="fixed right-5 top-20 z-[70] max-w-sm rounded-[14px] border border-emerald-100 bg-white px-4 py-3 text-sm font-bold text-emerald-700 shadow-xl shadow-slate-950/10">{message}</div>}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="heading text-3xl font-bold text-slate-950">Réclamations</h2>
          <p className="mt-1 text-slate-500">Suivi des demandes liées aux paiements, reçus et frais scolaires.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={printReclamations} className="grid h-12 w-12 place-items-center rounded-[8px] bg-slate-950 text-white" title="Imprimer"><Printer size={18} /></button>
          {isStudent && (
            <button type="button" onClick={() => setShowModal(true)} className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#102a2b] px-4 py-3 font-semibold text-white">
              <Plus size={18} />
              Nouvelle réclamation
            </button>
          )}
        </div>
      </div>

      <section className="surface rounded-[8px] p-5">
        <div className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
          <FileQuestion size={18} className="text-teal-700" />
          Historique des réclamations
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr><th className="py-3">Élève</th><th>Objet</th><th>Paiement</th><th>Message</th><th>Réponse</th><th>Date</th><th>Statut</th>{canManage && <th>Action</th>}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td className="py-4 text-slate-500" colSpan={canManage ? 8 : 7}>Chargement...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="py-4 text-slate-500" colSpan={canManage ? 8 : 7}>Aucune réclamation.</td></tr>
              ) : rows.map((row: any) => (
                <tr key={row.id}>
                  <td className="py-3 font-semibold text-slate-900">{row.student_name}</td>
                  <td>{row.subject}</td>
                  <td>{row.payment_reference ? `${row.payment_reference} - ${money(row.payment_amount, row.payment_currency)}` : "-"}</td>
                  <td className="max-w-[220px]">{row.message}</td>
                  <td className="max-w-[220px]">{row.response ?? "-"}</td>
                  <td>{shortDate(row.created_at)}</td>
                  <td><span className={`rounded-full px-3 py-1 text-xs font-bold ${row.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{row.status === "resolved" ? "Résolue" : "En cours"}</span></td>
                  {canManage && (
                    <td>
                      {row.status === "resolved" ? (
                        <span className="text-xs font-bold text-slate-400">Traitée</span>
                      ) : (
                        <div className="flex min-w-[260px] items-center gap-2">
                          <input
                            className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-xs outline-none focus:border-teal-600"
                            placeholder="Réponse"
                            value={responseById[row.id] ?? ""}
                            onChange={(e) => setResponseById((previous) => ({ ...previous, [row.id]: e.target.value }))}
                          />
                          <button
                            type="button"
                            onClick={() => setConfirmResolve({ id: row.id, response: responseById[row.id] || "Votre réclamation a été examinée et traitée." })}
                            className="grid h-9 w-9 place-items-center rounded-[8px] bg-emerald-600 text-white"
                            title="Résoudre"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} size={10} onPageChange={setPage} />
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-3 py-6 backdrop-blur-sm">
          <form onSubmit={submit} className="w-full max-w-xl rounded-[18px] bg-white p-5 shadow-2xl shadow-slate-950/20">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="heading text-xl font-extrabold text-slate-950">Nouvelle réclamation</h3>
                <p className="text-sm text-slate-500">Décrivez clairement le problème constaté.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="grid h-9 w-9 place-items-center rounded-[8px] bg-slate-100 text-slate-600"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input required className="w-full rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Objet" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <textarea required className="min-h-32 w-full rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-[8px] bg-slate-100 px-4 py-2.5 font-bold text-slate-700">Annuler</button>
              <button type="submit" disabled={createMutation.isPending} className="rounded-[8px] bg-[#102a2b] px-4 py-2.5 font-bold text-white disabled:opacity-60">
                {createMutation.isPending ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmCreate && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 px-3 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[18px] bg-white p-5 shadow-2xl shadow-slate-950/20">
            <h3 className="heading text-lg font-extrabold text-slate-950">Confirmer l'envoi</h3>
            <p className="mt-2 text-sm text-slate-600">Voulez-vous envoyer cette réclamation ?</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmCreate(false)} className="rounded-[8px] bg-slate-100 px-4 py-2.5 font-bold text-slate-700">Annuler</button>
              <button type="button" onClick={() => createMutation.mutate()} className="rounded-[8px] bg-[#102a2b] px-4 py-2.5 font-bold text-white">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {confirmResolve && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 px-3 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[18px] bg-white p-5 shadow-2xl shadow-slate-950/20">
            <h3 className="heading text-lg font-extrabold text-slate-950">Confirmer le traitement</h3>
            <p className="mt-2 text-sm text-slate-600">Voulez-vous marquer cette réclamation comme résolue ?</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmResolve(null)} className="rounded-[8px] bg-slate-100 px-4 py-2.5 font-bold text-slate-700">Annuler</button>
              <button type="button" onClick={() => updateMutation.mutate(confirmResolve)} className="rounded-[8px] bg-[#102a2b] px-4 py-2.5 font-bold text-white">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
