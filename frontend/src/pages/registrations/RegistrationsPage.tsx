import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookPlus, Filter, Printer, X } from "lucide-react";

import {
  createPayment,
  createRegistration,
  getAcademicYears,
  getClasses,
  getFees,
  getOptions,
  getRegistrations,
  getSections,
  getStudents,
} from "../../services/adminService";
import { Pagination } from "../../components/Pagination";
import { useAuth } from "../../contexts/AuthContext";
import { money, shortDate } from "../../utils/format";
import { printTable } from "../../utils/print";

const initialForm = {
  type_inscription: "nouvelle",
  student_id: "",
  academic_year_id: "",
  section_id: "",
  option_id: "",
  classroom_id: "",
  fee_id: "",
  montant: "",
};

export function RegistrationsPage() {
  const queryClient = useQueryClient();
  const { hasRole, hasPermission } = useAuth();
  const canRegister = hasRole("ROLE_COMPTABLE") && hasPermission("registrations.manage");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(initialForm);

  const registrationsQuery = useQuery({ queryKey: ["registrations", page], queryFn: () => getRegistrations({ page, size: 10 }) });
  const studentsQuery = useQuery({ queryKey: ["students-for-registration"], queryFn: () => getStudents({ page: 1, size: 100 }), enabled: canRegister });
  const yearsQuery = useQuery({ queryKey: ["academic-years"], queryFn: getAcademicYears });
  const sectionsQuery = useQuery({ queryKey: ["sections"], queryFn: getSections });
  const optionsQuery = useQuery({ queryKey: ["options"], queryFn: getOptions });
  const classesQuery = useQuery({ queryKey: ["classes"], queryFn: getClasses });
  const feesQuery = useQuery({ queryKey: ["fees"], queryFn: getFees, enabled: canRegister });

  const years = yearsQuery.data ?? [];
  const sections = sectionsQuery.data ?? [];
  const options = optionsQuery.data ?? [];
  const classes = classesQuery.data ?? [];
  const fees = feesQuery.data ?? [];
  const students = studentsQuery.data?.items ?? [];
  const registrations = registrationsQuery.data?.items ?? [];
  const total = registrationsQuery.data?.total ?? 0;
  const activeYear = years.find((year: any) => year.active) ?? years[0];
  const filteredOptions = options.filter((option: any) => !form.section_id || String(option.section_id) === form.section_id);
  const filteredClasses = classes.filter((classe: any) => !form.option_id || String(classe.option_id) === form.option_id);
  const selectedYearId = form.academic_year_id || String(activeYear?.id ?? "");
  const inscriptionFees = fees.filter((fee: any) => String(fee.academic_year_id) === selectedYearId && String(fee.statut) === "actif");
  const selectedFee = inscriptionFees.find((fee: any) => String(fee.id) === form.fee_id);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (activeYear?.id && !form.academic_year_id) {
      setForm((previous) => ({ ...previous, academic_year_id: String(activeYear.id) }));
    }
  }, [activeYear?.id, form.academic_year_id]);

  useEffect(() => {
    if (selectedFee && !form.montant) {
      setForm((previous) => ({ ...previous, montant: String(selectedFee.montant) }));
    }
  }, [selectedFee, form.montant]);

  const mutation = useMutation({
    mutationFn: async () => {
      await createPayment({
        student_id: Number(form.student_id),
        fee_id: Number(form.fee_id),
        montant: form.montant,
        devise: selectedFee?.devise ?? "USD",
      });
      await createRegistration({
        student_id: Number(form.student_id),
        academic_year_id: Number(form.academic_year_id),
        classroom_id: Number(form.classroom_id),
        type_inscription: form.type_inscription,
        date_inscription: new Date().toISOString().slice(0, 10),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["registrations"] }),
        queryClient.invalidateQueries({ queryKey: ["payments"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      setShowModal(false);
      setConfirmOpen(false);
      setForm(initialForm);
      setMessage("Inscription validée après paiement des frais d'inscription.");
    },
    onError: () => {
      setConfirmOpen(false);
      setMessage("Impossible de valider l'inscription. Vérifiez les champs et le paiement.");
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.student_id || !form.academic_year_id || !form.classroom_id || !form.fee_id || !form.montant) {
      setMessage("Sélectionnez l'élève, l'année, la classe et le frais d'inscription à payer.");
      return;
    }
    setConfirmOpen(true);
  };

  const printRegistrations = () => {
    printTable("Liste des inscriptions", [
      { label: "Élève", value: (registration: any) => registration.student_name },
      { label: "Type", value: (registration: any) => registration.type_inscription === "reinscription" ? "Réinscription" : "Nouvelle inscription" },
      { label: "Année", value: (registration: any) => registration.annee_scolaire },
      { label: "Classe", value: (registration: any) => registration.classe },
      { label: "Date", value: (registration: any) => shortDate(registration.date_inscription) },
      { label: "Statut", value: (registration: any) => registration.statut },
    ], registrations);
  };

  const modalTitle = form.type_inscription === "nouvelle" ? "Nouvelle inscription" : "Réinscription";

  return (
    <div className="space-y-6">
      {message && <div className="fixed right-5 top-20 z-[70] max-w-sm rounded-[14px] border border-emerald-100 bg-white px-4 py-3 text-sm font-bold text-emerald-700 shadow-xl shadow-slate-950/10">{message}</div>}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="heading text-3xl font-bold text-slate-950">Inscriptions</h2>
          <p className="mt-1 text-slate-500">Le comptable paie les frais d'inscription, puis affecte l'élève à une année et une classe.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={printRegistrations} className="grid h-12 w-12 place-items-center rounded-[8px] bg-slate-950 text-white" title="Imprimer"><Printer size={18} /></button>
          {canRegister && (
            <button type="button" onClick={() => setShowModal(true)} className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#102a2b] px-4 py-3 font-semibold text-white">
              <BookPlus size={18} />
              Inscrire un élève
            </button>
          )}
        </div>
      </div>

      <section className="surface rounded-[8px] p-5">
        <div className="mb-4 flex items-center gap-2 text-slate-700">
          <Filter size={18} className="text-teal-700" />
          <span className="font-semibold">Liste des élèves inscrits et réinscrits</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr><th className="py-3">Élève</th><th>Type</th><th>Année</th><th>Classe</th><th>Date</th><th>Statut</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrationsQuery.isLoading ? (
                <tr><td className="py-4 text-slate-500" colSpan={6}>Chargement...</td></tr>
              ) : registrations.length === 0 ? (
                <tr><td className="py-4 text-slate-500" colSpan={6}>Aucune inscription enregistrée.</td></tr>
              ) : (
                registrations.map((registration: any) => (
                  <tr key={registration.id}>
                    <td className="py-3 font-semibold text-slate-900">{registration.student_name}</td>
                    <td>{registration.type_inscription === "reinscription" ? "Réinscription" : "Nouvelle inscription"}</td>
                    <td>{registration.annee_scolaire ?? "-"}</td>
                    <td>{registration.classe ?? "-"}</td>
                    <td>{shortDate(registration.date_inscription)}</td>
                    <td><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{registration.statut}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} size={10} onPageChange={setPage} />
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 px-3 py-6 backdrop-blur-sm">
          <form onSubmit={submit} className="w-full max-w-3xl rounded-[18px] bg-white p-5 shadow-2xl shadow-slate-950/20">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="heading text-xl font-extrabold text-slate-950">{modalTitle}</h3>
                <p className="text-sm text-slate-500">Choisissez un élève déjà ajouté, payez le frais d'inscription, puis affectez-le.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="grid h-9 w-9 place-items-center rounded-[8px] bg-slate-100 text-slate-600"><X size={18} /></button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <select className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" value={form.type_inscription} onChange={(e) => setForm({ ...form, type_inscription: e.target.value })}>
                <option value="nouvelle">Nouvelle inscription</option>
                <option value="reinscription">Réinscription</option>
              </select>
              <select className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" value={form.academic_year_id} onChange={(e) => setForm({ ...form, academic_year_id: e.target.value, fee_id: "", montant: "" })}>
                <option value="">Année scolaire en cours</option>
                {years.map((year: any) => <option key={year.id} value={year.id}>{year.libelle}{year.active ? " - active" : ""}</option>)}
              </select>
              <select className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600 sm:col-span-2" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
                <option value="">Sélectionnez l'élève déjà ajouté</option>
                {students.map((student: any) => <option key={student.id} value={student.id}>{student.matricule} - {student.user?.nom} {student.user?.postnom} {student.user?.prenom}</option>)}
              </select>
              <select className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" value={form.section_id} onChange={(e) => setForm({ ...form, section_id: e.target.value, option_id: "", classroom_id: "" })}>
                <option value="">Section</option>
                {sections.map((section: any) => <option key={section.id} value={section.id}>{section.nom}</option>)}
              </select>
              <select className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" value={form.option_id} onChange={(e) => setForm({ ...form, option_id: e.target.value, classroom_id: "" })}>
                <option value="">Option</option>
                {filteredOptions.map((option: any) => <option key={option.id} value={option.id}>{option.nom}</option>)}
              </select>
              <select className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" value={form.classroom_id} onChange={(e) => setForm({ ...form, classroom_id: e.target.value })}>
                <option value="">Classe</option>
                {filteredClasses.map((classe: any) => <option key={classe.id} value={classe.id}>{classe.nom}</option>)}
              </select>
              <select className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600" value={form.fee_id} onChange={(e) => setForm({ ...form, fee_id: e.target.value, montant: String(inscriptionFees.find((fee: any) => String(fee.id) === e.target.value)?.montant ?? "") })}>
                <option value="">Frais d'inscription à payer</option>
                {inscriptionFees.map((fee: any) => <option key={fee.id} value={fee.id}>{fee.fee_type} - {money(fee.montant, fee.devise)}</option>)}
              </select>
              <input required className="rounded-[8px] border border-slate-200 px-3 py-2 outline-none focus:border-teal-600 sm:col-span-2" placeholder="Montant payé" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-[8px] bg-slate-100 px-4 py-2.5 font-bold text-slate-700">Annuler</button>
              <button type="submit" disabled={mutation.isPending} className="rounded-[8px] bg-[#102a2b] px-4 py-2.5 font-bold text-white disabled:opacity-60">
                {mutation.isPending ? "Validation..." : "Payer et inscrire"}
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 px-3 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[18px] bg-white p-5 shadow-2xl shadow-slate-950/20">
            <h3 className="heading text-lg font-extrabold text-slate-950">Confirmer l'inscription</h3>
            <p className="mt-2 text-sm text-slate-600">Voulez-vous enregistrer le paiement puis affecter cet élève à l'année et à la classe sélectionnées ?</p>
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
