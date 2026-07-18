import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Trash2, X } from "lucide-react";

import {
  closeAcademicYear,
  createAcademicYear,
  createClassroom,
  createFee,
  createFeeType,
  createOption,
  createSection,
  createUser,
  deleteAcademicYear,
  deleteClassroom,
  deleteFee,
  deleteOption,
  deleteSection,
  getAcademicYears,
  getClasses,
  getFees,
  getOptions,
  getRoles,
  getSections,
  getUsers,
  updateUserStatus,
} from "../../services/adminService";
import { useAuth } from "../../contexts/AuthContext";


const levelOptions = {
  EB: ["7ième", "8ième"],
  SECONDAIRE: ["1ière", "2ième", "3ième", "4ième"],
};

const roleLabels: Record<string, string> = {
  ROLE_ADMIN: "Administrateur",
  ROLE_COMPTABLE: "Comptable",
  ROLE_SECRETAIRE: "Secrétaire",
  ROLE_PREFET: "Préfet",
  ROLE_DIRECTION: "Direction",
  ROLE_ELEVE: "Élève",
};

type ModalView =
  | "create-year"
  | "close-year"
  | "create-section"
  | "create-option"
  | "configure-fees"
  | "create-user"
  | "edit-user"
  | null;

type AdminRole = {
  code: string;
  nom: string;
  permissions: string[];
};

type AdminUser = {
  id: string | number;
  nom: string;
  prenom?: string;
  email: string;
  login: string;
  type_utilisateur: string;
  statut?: string;
};

type UserEditForm = {
  nom: string;
  prenom: string;
  email: string;
  login: string;
  role_code: string;
};

type AdminYear = { id: string; libellé: string; dateDebut: string; dateFin: string; statut: string };
type AdminSection = { id: string; nom: string };
type AdminOption = { id: string; nom: string; sectionId: string; niveauType: string; niveaux: string[]; classes: string[] };
type AdminClass = { id: string; nom: string; sectionId: string; optionId: string; niveauType: string; niveau: string };
type AdminFee = { id: string; type: string; cible: string; référence: string; montant: string };

type ConfirmAction = {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
};

export function AdministrationPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const location = useLocation();
  const activeTab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") ?? "";
  }, [location.search]);
  const [modalView, setModalView] = useState<ModalView>(null);
  const [message, setMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: () => getUsers({ page: 1, size: 12 }) });
  const rolesQuery = useQuery({ queryKey: ["admin-roles"], queryFn: getRoles });
  const yearsQuery = useQuery({ queryKey: ["academic-years"], queryFn: getAcademicYears });
  const sectionsQuery = useQuery({ queryKey: ["sections"], queryFn: getSections });
  const optionsQuery = useQuery({ queryKey: ["options"], queryFn: getOptions });
  const classesQuery = useQuery({ queryKey: ["classes"], queryFn: getClasses });
  const feesQuery = useQuery({ queryKey: ["fees"], queryFn: getFees });
  const roles = useMemo(() => (rolesQuery.data ?? []) as AdminRole[], [rolesQuery.data]);
  const users = useMemo(() => (usersQuery.data?.items ?? []) as AdminUser[], [usersQuery.data?.items]);
  const permissionCount = useMemo(
    () => roles.reduce((total, role) => total + role.permissions.length, 0),
    [roles]
  );

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    login: "",
    password: "",
    role_code: "ROLE_COMPTABLE",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [editForm, setEditForm] = useState<UserEditForm>({ nom: "", prenom: "", email: "", login: "", role_code: "ROLE_COMPTABLE" });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [disabledUsers, setDisabledUsers] = useState<Record<string, boolean>>({});
  const [editedUsers, setEditedUsers] = useState<Record<string, UserEditForm>>({});

  const [yearForm, setYearForm] = useState({ libellé: "", dateDebut: "", dateFin: "" });
  const [yearsToClose, setYearsToClose] = useState("");
  const years = useMemo<AdminYear[]>(
    () =>
      (yearsQuery.data ?? []).map((year: any) => ({
        id: String(year.id),
        libellé: year.libelle,
        dateDebut: year.date_debut ?? "",
        dateFin: year.date_fin ?? "",
        statut: year.active ? "Ouverte" : "Clôturée",
      })),
    [yearsQuery.data]
  );
  const activeYear = years.find((year) => year.statut === "Ouverte");

  const [sectionForm, setSectionForm] = useState({ nom: "" });
  const sections = useMemo<AdminSection[]>(() => (sectionsQuery.data ?? []).map((section: any) => ({ id: String(section.id), nom: section.nom })), [sectionsQuery.data]);
  const [optionForm, setOptionForm] = useState({ nom: "", sectionId: "", niveauType: "EB", niveaux: [] as string[], classes: [] as string[] });
  const options = useMemo<AdminOption[]>(
    () => (optionsQuery.data ?? []).map((option: any) => ({ id: String(option.id), nom: option.nom, sectionId: String(option.section_id), niveauType: "", niveaux: [], classes: [] })),
    [optionsQuery.data]
  );
  const classes = useMemo<AdminClass[]>(
    () =>
      (classesQuery.data ?? []).map((classe: any) => ({
        id: String(classe.id),
        nom: classe.nom,
        sectionId: String(classe.section_id ?? ""),
        optionId: String(classe.option_id),
        niveauType: "",
        niveau: classe.niveau ?? classe.nom,
      })),
    [classesQuery.data]
  );

  const [feesForm, setFeesForm] = useState({ type: "Inscription", cible: "all", référence: "", montant: "" });
  const fees = useMemo<AdminFee[]>(
    () =>
      (feesQuery.data ?? []).map((fee: any) => {
        const classroom = classes.find((item) => item.id === String(fee.class_id));
        return {
          id: String(fee.id),
          type: fee.fee_type,
          cible: fee.class_id ? "classe" : "all",
          référence: classroom?.nom ?? "Toutes les classes",
          montant: `${fee.montant} ${fee.devise ?? "USD"}`,
        };
      }),
    [feesQuery.data, classes]
  );

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const requestConfirmation = (action: ConfirmAction) => {
    setConfirmAction(action);
  };

  const runConfirmedAction = async () => {
    if (!confirmAction) return;
    const action = confirmAction;
    setConfirmAction(null);
    await action.onConfirm();
  };

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      setMessage("Utilisateur créé avec succès.");
      setForm({ nom: "", prenom: "", email: "", login: "", password: "", role_code: "ROLE_COMPTABLE" });
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => setMessage("Impossible de créer cet utilisateur. Vérifiez le login et l'email."),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    requestConfirmation({
      title: "Confirmer la création",
      description: "Voulez-vous créer cet utilisateur ?",
      confirmLabel: "Créer",
      onConfirm: () => createMutation.mutate({ ...form, password: form.password || "Passer@123" }),
    });
  };

  const handleOpenModal = (view: ModalView) => {
    setMessage("");
    setModalView(view);
  };

  const closeModal = () => {
    setModalView(null);
    setEditingUserId(null);
  };

  const handleDeleteConfig = (kind: "year" | "section" | "option" | "class" | "fee", id: string, title: string) => {
    const actions = {
      year: () => deleteAcademicYear(id),
      section: () => deleteSection(id),
      option: () => deleteOption(id),
      class: () => deleteClassroom(id),
      fee: () => deleteFee(id),
    };
    const queryKeys = {
      year: ["academic-years"],
      section: ["sections"],
      option: ["options"],
      class: ["classes"],
      fee: ["fees"],
    };
    requestConfirmation({
      title,
      description: "Voulez-vous supprimer cette configuration ?",
      confirmLabel: "Supprimer",
      onConfirm: async () => {
        await actions[kind]();
        await queryClient.invalidateQueries({ queryKey: queryKeys[kind] });
        setMessage("Configuration supprimée.");
      },
    });
  };
  const handleCreateYear = (event: FormEvent) => {
    event.preventDefault();
    if (activeYear) {
      setMessage("Clôturez l'année scolaire en cours avant d'en créer une nouvelle.");
      return;
    }
    if (!yearForm.libellé || !yearForm.dateDebut || !yearForm.dateFin) {
      setMessage("Veuillez renseigner le libellé, la date de début et la date de fin.");
      return;
    }
    if (yearForm.dateFin < yearForm.dateDebut) {
      setMessage("La date de fin ne doit pas être antérieure à la date de début.");
      return;
    }
    requestConfirmation({
      title: "Confirmer la création",
      description: `Voulez-vous créer l'année scolaire ${yearForm.libellé} ?`,
      confirmLabel: "Créer",
      onConfirm: async () => {
        await createAcademicYear({ libelle: yearForm.libellé, date_debut: yearForm.dateDebut, date_fin: yearForm.dateFin, active: true });
        await queryClient.invalidateQueries({ queryKey: ["academic-years"] });
        setYearForm({ libellé: "", dateDebut: "", dateFin: "" });
        setModalView(null);
        setMessage("Année scolaire créée avec succès.");
      },
    });
  };
  const handleCloseYear = (event: FormEvent) => {
    event.preventDefault();
    const yearId = yearsToClose || activeYear?.id || "";
    if (!yearId) {
      setMessage("Sélectionnez une année scolaire à clôturer.");
      return;
    }
    requestConfirmation({
      title: "Confirmer la clôture",
      description: "Voulez-vous clôturer l'année scolaire en cours ?",
      confirmLabel: "Clôturer",
      onConfirm: async () => {
        await closeAcademicYear(yearId);
        await queryClient.invalidateQueries({ queryKey: ["academic-years"] });
        setYearsToClose("");
        setModalView(null);
        setMessage("Année scolaire clôturée avec succès.");
      },
    });
  };
  const handleCreateSection = (event: FormEvent) => {
    event.preventDefault();
    if (!sectionForm.nom) {
      setMessage("Le nom de la section est requis.");
      return;
    }
    requestConfirmation({
      title: "Confirmer la création",
      description: `Voulez-vous créer la section ${sectionForm.nom} ?`,
      confirmLabel: "Créer",
      onConfirm: async () => {
        await createSection({ nom: sectionForm.nom });
        await queryClient.invalidateQueries({ queryKey: ["sections"] });
        setSectionForm({ nom: "" });
        setModalView(null);
        setMessage("Section créée avec succès.");
      },
    });
  };
  const handleCreateOption = (event: FormEvent) => {
    event.preventDefault();
    if (!optionForm.nom || !optionForm.sectionId || optionForm.niveaux.length === 0) {
      setMessage("Veuillez remplir l'option et sélectionner au moins une classe.");
      return;
    }
    requestConfirmation({
      title: "Confirmer la création",
      description: `Voulez-vous créer l'option ${optionForm.nom} avec les classes sélectionnées ?`,
      confirmLabel: "Créer",
      onConfirm: async () => {
        const createdOption = await createOption({ nom: optionForm.nom, section_id: Number(optionForm.sectionId) });
        const selectedClasses = optionForm.niveaux;
        await Promise.all(
          selectedClasses.map((classe) =>
            createClassroom({ nom: classe, niveau: optionForm.niveauType, option_id: Number(createdOption.id) })
          )
        );
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["options"] }),
          queryClient.invalidateQueries({ queryKey: ["classes"] }),
        ]);
        setOptionForm({ nom: "", sectionId: "", niveauType: "EB", niveaux: [], classes: [] });
        setModalView(null);
        setMessage("Option créée avec ses classes.");
      },
    });
  };
  const handleConfigureFees = (event: FormEvent) => {
    event.preventDefault();
    if (!feesForm.type || !feesForm.cible || (!feesForm.référence && feesForm.cible !== "all") || !feesForm.montant) {
      setMessage("Sélectionnez le type, la cible et renseignez un montant.");
      return;
    }
    if (!activeYear) {
      setMessage("Créez d'abord une année scolaire active avant de configurer les frais.");
      return;
    }
    requestConfirmation({
      title: "Confirmer la configuration",
      description: "Voulez-vous enregistrer cette configuration des frais scolaires ?",
      confirmLabel: "Enregistrer",
      onConfirm: async () => {
        const feeType = await createFeeType({ nom: feesForm.type });
        const targetClasses =
          feesForm.cible === "all"
            ? classes
            : feesForm.cible === "section"
              ? classes.filter((item) => item.sectionId === feesForm.référence)
              : feesForm.cible === "option"
                ? classes.filter((item) => item.optionId === feesForm.référence)
                : classes.filter((item) => item.id === feesForm.référence);
        const targets = targetClasses.length > 0 ? targetClasses : [{ id: null }];
        await Promise.all(
          targets.map((classe) =>
            createFee({
              fee_type_id: Number(feeType.id),
              academic_year_id: Number(activeYear.id),
              class_id: classe.id ? Number(classe.id) : null,
              montant: feesForm.montant,
              devise: "USD",
            })
          )
        );
        await queryClient.invalidateQueries({ queryKey: ["fees"] });
        setFeesForm({ type: feesForm.type, cible: feesForm.cible, référence: "", montant: "" });
        setModalView(null);
        setMessage("Frais scolaires configurés avec succès.");
      },
    });
  };
  const handleEditUser = (user: AdminUser) => {
    setEditingUserId(String(user.id));
    setEditForm({ nom: user.nom, prenom: user.prenom ?? "", email: user.email, login: user.login, role_code: user.type_utilisateur || "ROLE_COMPTABLE" });
    setModalView("edit-user");
  };

  const saveEditedUser = (event: FormEvent) => {
    event.preventDefault();
    if (!editingUserId) return;
    requestConfirmation({
      title: "Confirmer la modification",
      description: "Voulez-vous enregistrer les modifications de cet utilisateur ?",
      confirmLabel: "Modifier",
      onConfirm: () => {
        setEditedUsers((previous) => ({ ...previous, [editingUserId]: { ...editForm } }));
        setMessage("Informations utilisateur modifiées.");
        closeModal();
      },
    });
  };
  const handleToggleUserStatus = async (targetUser: AdminUser) => {
    const id = String(targetUser.id);
    if (id === String(currentUser?.id)) {
      setMessage("Vous ne pouvez pas désactiver votre propre compte utilisateur.");
      return;
    }
    const shouldActivate = disabledUsers[id] || targetUser.statut === "inactif" || targetUser.statut === "Désactivé";
    requestConfirmation({
      title: shouldActivate ? "Confirmer l'activation" : "Confirmer la désactivation",
      description: shouldActivate
        ? "Voulez-vous réactiver cet utilisateur ?"
        : "Voulez-vous désactiver cet utilisateur ? Il ne pourra plus se connecter.",
      confirmLabel: shouldActivate ? "Activer" : "Désactiver",
      onConfirm: async () => {
        setDisabledUsers((previous) => ({ ...previous, [id]: !shouldActivate }));
        try {
          await updateUserStatus(id, shouldActivate ? "actif" : "inactif");
          await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
          setMessage(shouldActivate ? "Utilisateur réactivé." : "Utilisateur désactivé du système.");
        } catch {
          setMessage(shouldActivate ? "Utilisateur réactivé localement." : "Utilisateur désactivé localement.");
        }
      },
    });
  };
  const visibleUsers = users.map((user) => {
    const edited = editedUsers[user.id];
    const mergedUser = edited ? { ...user, ...edited, type_utilisateur: edited.role_code } : user;
    return {
      ...mergedUser,
      statut: disabledUsers[String(user.id)] ? "Désactivé" : mergedUser.statut,
      roleLabel: roleLabels[mergedUser.type_utilisateur] ?? mergedUser.type_utilisateur,
    };
  });

  const renderYearsSection = () => (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {!activeYear && (
          <button onClick={() => handleOpenModal("create-year")} className="rounded-[12px] bg-[#10242f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#163747]">
            Créer l'année
          </button>
        )}
        {activeYear && (
          <button onClick={() => { setYearsToClose(activeYear.id); handleOpenModal("close-year"); }} className="rounded-[12px] bg-[#10242f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#163747]">
            Clôturer l'année
          </button>
        )}
      </div>
      <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="heading text-lg font-extrabold text-slate-900">Années scolaires</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr><th className="py-3">Libellé</th><th>Date début</th><th>Date fin</th><th>Statut</th><th>Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {years.length === 0 ? (
                <tr><td colSpan={5} className="py-4 text-sm text-slate-500">Aucune année scolaire enregistrée.</td></tr>
              ) : years.map((year) => (
                <tr key={year.id}>
                  <td className="py-3 font-semibold text-slate-800">{year.libellé}</td>
                  <td>{year.dateDebut}</td>
                  <td>{year.dateFin}</td>
                  <td><span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">{year.statut}</span></td>
                  <td><button type="button" onClick={() => handleDeleteConfig("year", year.id, "Supprimer l'année scolaire")} className="grid h-8 w-8 place-items-center rounded-[8px] bg-rose-50 text-rose-700" title="Supprimer"><Trash2 size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  const renderStructureSection = () => (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => handleOpenModal("create-section")} className="rounded-[12px] bg-[#10242f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#163747]">
          Créer une section
        </button>
        <button onClick={() => handleOpenModal("create-option")} className="rounded-[12px] bg-[#10242f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#163747]">
          Créer une option
        </button>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="heading text-base font-extrabold text-slate-900">Sections</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {sections.length === 0 ? <li>Aucune section créée.</li> : sections.map((section) => (
              <li key={section.id} className="flex items-center justify-between gap-2">
                <span>• {section.nom}</span>
                <button type="button" onClick={() => handleDeleteConfig("section", section.id, "Supprimer la section")} className="grid h-7 w-7 place-items-center rounded-[8px] bg-rose-50 text-rose-700" title="Supprimer"><Trash2 size={14} /></button>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="heading text-base font-extrabold text-slate-900">Options</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {options.length === 0 ? <li>Aucune option créée.</li> : options.map((option) => (
              <li key={option.id}>
                <span className="font-semibold text-slate-800">{option.nom}</span> ({option.niveauType})
                <button type="button" onClick={() => handleDeleteConfig("option", option.id, "Supprimer l'option")} className="ml-2 inline-grid h-7 w-7 place-items-center rounded-[8px] bg-rose-50 text-rose-700" title="Supprimer"><Trash2 size={14} /></button>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="heading text-base font-extrabold text-slate-900">Classes</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {classes.length === 0 ? <li>Aucune classe créée.</li> : classes.map((classe) => (
              <li key={classe.id} className="flex items-center justify-between gap-2">
                <span>• {classe.nom} — {classe.niveau}</span>
                <button type="button" onClick={() => handleDeleteConfig("class", classe.id, "Supprimer la classe")} className="grid h-7 w-7 place-items-center rounded-[8px] bg-rose-50 text-rose-700" title="Supprimer"><Trash2 size={14} /></button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderFeesSection = () => (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => handleOpenModal("configure-fees")} className="rounded-[12px] bg-[#10242f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#163747]">
          Configurer les frais scolaires
        </button>
      </div>
      <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="heading text-lg font-extrabold text-slate-900">Frais configurés</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr><th className="py-3">Type</th><th>Cible</th><th>Référence</th><th>Montant</th><th>Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fees.length === 0 ? (
                <tr><td colSpan={5} className="py-4 text-sm text-slate-500">Aucune configuration de frais.</td></tr>
              ) : fees.map((fee) => (
                <tr key={fee.id}>
                  <td className="py-3 text-slate-800">{fee.type}</td>
                  <td>{fee.cible}</td>
                  <td>{fee.référence}</td>
                  <td>{fee.montant}</td>
                  <td><button type="button" onClick={() => handleDeleteConfig("fee", fee.id, "Supprimer le frais")} className="grid h-8 w-8 place-items-center rounded-[8px] bg-rose-50 text-rose-700" title="Supprimer"><Trash2 size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsersSection = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h3 className="heading text-lg font-extrabold text-slate-900">Utilisateurs du système</h3>
          <p className="mt-2 text-sm text-slate-500">Liste de tous les utilisateurs avec création et gestion par popup.</p>
        </div>
        <button onClick={() => handleOpenModal("create-user")} className="rounded-[12px] bg-[#10242f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#163747]">
          Créer un utilisateur
        </button>
      </div>
      <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr><th className="py-3">Nom</th><th>Rôle</th><th>Statut</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleUsers.length === 0 ? (
                <tr><td colSpan={4} className="py-4 text-sm text-slate-500">Aucun utilisateur trouvé.</td></tr>
              ) : visibleUsers.map((user) => (
                <tr key={user.id}>
                  <td className="py-3 font-semibold text-slate-800">{user.nom} {user.prenom}</td>
                  <td>{user.roleLabel}</td>
                  <td><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${(user.statut === "Désactivé" || user.statut === "inactif") ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{user.statut}</span></td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleEditUser(user)} className="rounded-[10px] bg-slate-100 px-3 py-1 text-[12px] font-bold text-slate-700 transition hover:bg-slate-200">
                      Modifier
                    </button>
                    <button onClick={() => handleToggleUserStatus(user)} disabled={String(user.id) === String(currentUser?.id)} className={`ml-2 rounded-[10px] px-3 py-1 text-[12px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${user.statut === "Désactivé" || user.statut === "inactif" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-rose-100 text-rose-700 hover:bg-rose-200"}`}>
                      {user.statut === "Désactivé" || user.statut === "inactif" ? "Activer" : "Désactiver"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRolesSection = () => (
    <div className="space-y-5">
      <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="heading text-lg font-extrabold text-slate-900">Rôles et permissions</h3>
        <p className="mt-2 text-sm text-slate-500">Les rôles définissent les permissions et l'accès aux différentes pages.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.length === 0 ? (
          <div className="rounded-[14px] border border-slate-200 bg-white p-4 text-sm text-slate-500">Aucun rôle disponible.</div>
        ) : roles.map((role) => (
          <div key={role.code} className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-extrabold text-slate-900">{roleLabels[role.code] ?? role.nom}</p>
            <p className="mt-1 text-sm text-slate-500">{role.permissions.length} permission(s)</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {role.permissions.map((permission: string) => (
                <span key={permission} className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">{permission}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "années":
        return renderYearsSection();
      case "structure":
        return renderStructureSection();
      case "frais":
        return renderFeesSection();
      case "utilisateurs":
        return renderUsersSection();
      case "roles":
        return renderRolesSection();
      default:
        return (
          <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
            Sélectionnez un module dans le menu d'administration pour afficher son contenu.
          </div>
        );
    }
  };

  return (
    <div className="space-y-5 text-[13px]">
      {message && (
        <div className="fixed right-5 top-20 z-[70] max-w-sm rounded-[14px] border border-emerald-100 bg-white px-4 py-3 text-sm font-bold text-emerald-700 shadow-xl shadow-slate-950/10">
          {message}
        </div>
      )}

      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700">Administration</p>
          <h2 className="heading mt-1 text-2xl font-extrabold text-[#0b1f33]">Administration centrale</h2>
          <p className="mt-1 text-sm text-slate-500">Sélectionnez un module pour gérer les années, sections, frais, utilisateurs et permissions.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-[12px] bg-white/80 px-4 py-2 shadow-sm">
            <p className="heading text-lg font-extrabold text-[#0b1f33]">{usersQuery.data?.total ?? 0}</p>
            <p className="text-[11px] font-bold text-slate-500">Utilisateurs</p>
          </div>
          <div className="rounded-[12px] bg-white/80 px-4 py-2 shadow-sm">
            <p className="heading text-lg font-extrabold text-[#0b1f33]">{roles.length}</p>
            <p className="text-[11px] font-bold text-slate-500">Rôles</p>
          </div>
          <div className="rounded-[12px] bg-white/80 px-4 py-2 shadow-sm">
            <p className="heading text-lg font-extrabold text-[#0b1f33]">{permissionCount}</p>
            <p className="text-[11px] font-bold text-slate-500">Droits</p>
          </div>
        </div>
      </div>

      <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm">
        {renderActiveTab()}
      </div>

      {modalView && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-sm px-3 py-6">
          <div className="w-full max-w-3xl rounded-[24px] bg-white p-6 shadow-2xl shadow-slate-950/20">
            <div className="flex items-start justify-between gap-4">
              <h3 className="heading text-xl font-extrabold text-slate-900">
                {modalView === "create-year" && "Créer une année scolaire"}
                {modalView === "close-year" && "Clôturer une année scolaire"}
                {modalView === "create-section" && "Créer une section"}
                {modalView === "create-option" && "Créer une option"}
                {modalView === "configure-fees" && "Configurer les frais scolaires"}
                {modalView === "create-user" && "Créer un utilisateur"}
                {modalView === "edit-user" && "Modifier un utilisateur"}
              </h3>
              <button onClick={closeModal} className="rounded-full border border-slate-200 bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5">
              {(modalView === "create-year" || modalView === "close-year") && (
                <form onSubmit={modalView === "create-year" ? handleCreateYear : handleCloseYear} className="space-y-4">
                  {modalView === "create-year" ? (
                    <>
                      <input
                        className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500"
                        placeholder="Libellé de l'année (ex. 2025-2026)"
                        value={yearForm.libellé}
                        onChange={(e) => setYearForm({ ...yearForm, libellé: e.target.value })}
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500"
                          type="date"
                          value={yearForm.dateDebut}
                          onChange={(e) => setYearForm({ ...yearForm, dateDebut: e.target.value })}
                        />
                        <input
                          className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500"
                          type="date"
                          min={yearForm.dateDebut || undefined}
                          value={yearForm.dateFin}
                          onChange={(e) => setYearForm({ ...yearForm, dateFin: e.target.value })}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="rounded-[12px] bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                      Confirmez la clôture de l'année {activeYear?.libellé}.
                    </p>
                  )}
                  {message && <p className="rounded-[12px] bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{message}</p>}
                  <button type="submit" className="rounded-[12px] bg-[#10242f] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#163747]">
                    {modalView === "create-year" ? "Créer l'année" : "Clôturer l'année"}
                  </button>
                </form>
              )}

              {modalView === "create-section" && (
                <form onSubmit={handleCreateSection} className="space-y-4">
                  <input
                    className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500"
                    placeholder="Nom de la section"
                    value={sectionForm.nom}
                    onChange={(e) => setSectionForm({ nom: e.target.value })}
                  />
                  {message && <p className="rounded-[12px] bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{message}</p>}
                  <button type="submit" className="rounded-[12px] bg-[#10242f] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#163747]">Créer la section</button>
                </form>
              )}

              {modalView === "create-option" && (
                <form onSubmit={handleCreateOption} className="space-y-4">
                  <select
                    className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500"
                    value={optionForm.sectionId}
                    onChange={(e) => setOptionForm({ ...optionForm, sectionId: e.target.value, classes: [], niveaux: [] })}
                  >
                    <option value="">Sélectionnez une section</option>
                    {sections.map((section) => <option key={section.id} value={section.id}>{section.nom}</option>)}
                  </select>
                  <input
                    className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500"
                    placeholder="Nom de l'option"
                    value={optionForm.nom}
                    onChange={(e) => setOptionForm({ ...optionForm, nom: e.target.value })}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      className="rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500"
                      value={optionForm.niveauType}
                      onChange={(e) => setOptionForm({ ...optionForm, niveauType: e.target.value, niveaux: [], classes: [] })}
                    >
                      <option value="EB">EB</option>
                      <option value="SECONDAIRE">Secondaire</option>
                    </select>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700">Sélectionnez les classes</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {levelOptions[optionForm.niveauType as "EB" | "SECONDAIRE"].map((level, index) => {
                          const lowerLevels = levelOptions[optionForm.niveauType as "EB" | "SECONDAIRE"].slice(0, index);
                          const canSelect = lowerLevels.every((lower) => optionForm.niveaux.includes(lower));
                          const selected = optionForm.niveaux.includes(level);
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => {
                                if (selected) {
                                  const allowedAfterRemove = levelOptions[optionForm.niveauType as "EB" | "SECONDAIRE"].slice(0, index);
                                  setOptionForm({
                                    ...optionForm,
                                    niveaux: optionForm.niveaux.filter((item) => allowedAfterRemove.includes(item)),
                                  });
                                  return;
                                }
                                if (!canSelect && lowerLevels.length > 0) return;
                                setOptionForm({ ...optionForm, niveaux: [...optionForm.niveaux, level] });
                              }}
                              className={`rounded-[10px] border px-3 py-2 text-sm transition ${selected ? "border-emerald-500 bg-emerald-50 text-emerald-700" : canSelect ? "border-slate-200 bg-white text-slate-700" : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                              disabled={!canSelect && !selected}
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  {message && <p className="rounded-[12px] bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{message}</p>}
                  <button type="submit" className="rounded-[12px] bg-[#10242f] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#163747]">Créer l'option</button>
                </form>
              )}

              {modalView === "configure-fees" && (
                <form onSubmit={handleConfigureFees} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500" value={feesForm.type} onChange={(e) => setFeesForm({ ...feesForm, type: e.target.value })}>
                      <option value="Inscription">Inscription</option>
                      <option value="Scolarité">Scolarité</option>
                      <option value="Cantine">Cantine</option>
                      <option value="Autre">Autre</option>
                    </select>
                    <select className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500" value={feesForm.cible} onChange={(e) => setFeesForm({ ...feesForm, cible: e.target.value, référence: "" })}>
                      <option value="all">Toutes les classes</option>
                      <option value="section">Section</option>
                      <option value="option">Option</option>
                      <option value="classe">Classe spécifique</option>
                    </select>
                  </div>
                  {feesForm.cible !== "all" && (
                    <select className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500" value={feesForm.référence} onChange={(e) => setFeesForm({ ...feesForm, référence: e.target.value })}>
                      <option value="">Sélectionnez une référence</option>
                      {feesForm.cible === "section" && sections.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}
                      {feesForm.cible === "option" && options.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}
                      {feesForm.cible === "classe" && classes.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}
                    </select>
                  )}
                  <input className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500" placeholder="Montant" value={feesForm.montant} onChange={(e) => setFeesForm({ ...feesForm, montant: e.target.value })} />
                  {message && <p className="rounded-[12px] bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{message}</p>}
                  <button type="submit" className="rounded-[12px] bg-[#10242f] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#163747]">Enregistrer</button>
                </form>
              )}

              {modalView === "create-user" && (
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500" placeholder="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
                    <input className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500" placeholder="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
                  </div>
                  <input className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500" placeholder="Login" value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} required />
                    <div className="relative">
                      <input className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-[13px] outline-none focus:border-emerald-500" placeholder="Mot de passe" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                      <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[8px] p-1.5 text-slate-500 transition hover:bg-slate-200" title={showPassword ? "Masquer" : "Afficher"}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <select className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500" value={form.role_code} onChange={(e) => setForm({ ...form, role_code: e.target.value })}>
                    {roles.map((role) => <option key={role.code} value={role.code}>{roleLabels[role.code] ?? role.nom}</option>)}
                  </select>
                  {message && <p className="rounded-[12px] bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{message}</p>}
                  <button type="submit" disabled={createMutation.isPending} className="rounded-[12px] bg-[#10242f] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#163747] disabled:opacity-60">
                    {createMutation.isPending ? "Création..." : "Créer l'utilisateur"}
                  </button>
                </form>
              )}

              {modalView === "edit-user" && (
                <form onSubmit={saveEditedUser} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500" placeholder="Nom" value={editForm.nom} onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })} />
                    <input className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500" placeholder="Prénom" value={editForm.prenom} onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })} />
                  </div>
                  <input className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500" placeholder="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                  <input className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500" placeholder="Login" value={editForm.login} onChange={(e) => setEditForm({ ...editForm, login: e.target.value })} />
                  <select className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-emerald-500" value={editForm.role_code} onChange={(e) => setEditForm({ ...editForm, role_code: e.target.value })}>
                    {roles.map((role) => <option key={role.code} value={role.code}>{roleLabels[role.code] ?? role.nom}</option>)}
                  </select>
                  <button type="submit" className="rounded-[12px] bg-[#10242f] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#163747]">Enregistrer</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 backdrop-blur-sm px-3 py-6">
          <div className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-2xl shadow-slate-950/20">
            <h3 className="heading text-lg font-extrabold text-slate-900">{confirmAction.title}</h3>
            <p className="mt-3 text-sm text-slate-600">{confirmAction.description}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-[12px] bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void runConfirmedAction()}
                className="rounded-[12px] bg-[#10242f] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#163747]"
              >
                {confirmAction.confirmLabel ?? "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}








