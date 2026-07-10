import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  ChevronDown,
  CreditCard,
  FileCheck2,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  LockKeyhole,
  ReceiptText,
  School,
  ShieldCheck,
  Sparkles,
  UserCog,
} from "lucide-react";
import { Link } from "react-router-dom";

const advantages = [
  {
    title: "Inscriptions maitrisees",
    description: "Creation des eleves, inscriptions, reinscriptions et suivi des classes dans un meme espace.",
    icon: BookOpenCheck,
  },
  {
    title: "Paiements fiables",
    description: "Encaissements traces, soldes calcules automatiquement et recus generes sans ressaisie.",
    icon: CreditCard,
  },
  {
    title: "Acces par role",
    description: "Administrateur, agent comptable et eleve disposent chacun d'un espace limite a leurs droits.",
    icon: ShieldCheck,
  },
  {
    title: "Dossiers consultables",
    description: "Chaque eleve retrouve son profil, son inscription, ses frais, ses paiements et son etat financier.",
    icon: FileCheck2,
  },
];

const roleCards = [
  {
    role: "Administrateur",
    text: "Configure les annees scolaires, sections, options, classes, frais, utilisateurs, roles et permissions.",
    icon: UserCog,
  },
  {
    role: "Agent comptable",
    text: "Enregistre les paiements, consulte les soldes, edite les recus et suit les encaissements de l'etablissement.",
    icon: Landmark,
  },
  {
    role: "Eleve",
    text: "Consulte son profil, son inscription, ses paiements, son solde, ses recus et ses informations personnelles.",
    icon: GraduationCap,
  },
];

const functionalities = [
  "Gestion des eleves avec photo de profil",
  "Options, sections, classes et annees scolaires",
  "Inscriptions et reinscriptions",
  "Configuration des frais scolaires",
  "Paiements, soldes et historiques",
  "Generation automatique des recus",
  "Tableaux de bord par profil",
  "Roles, permissions et securite",
];

const faqs = [
  {
    question: "Qui peut creer un eleve dans le systeme ?",
    answer:
      "L'administrateur dispose des droits de creation et de gestion des eleves. Il peut aussi configurer les classes, options, sections, frais et utilisateurs du systeme.",
  },
  {
    question: "Le comptable peut-il modifier les parametres administratifs ?",
    answer:
      "Non. L'agent comptable travaille sur le volet financier : enregistrement des paiements, verification des soldes, edition des recus et consultation des historiques autorises.",
  },
  {
    question: "Que voit un eleve apres connexion ?",
    answer:
      "L'eleve accede uniquement a ses propres donnees : profil, inscription, classe, option, frais, paiements, recus et solde restant. Il ne peut pas consulter les informations d'un autre eleve.",
  },
  {
    question: "Les recus de paiement sont-ils generes automatiquement ?",
    answer:
      "Oui. Apres l'enregistrement d'un paiement, le systeme prepare un recu numerote et rattache a l'eleve, au frais concerne et a l'agent qui a realise l'operation.",
  },
];

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <main className="min-h-screen bg-[#f4f8f7] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#0e4f4a] text-white shadow-lg shadow-emerald-950/15">
              <School size={20} />
            </span>
            <span>
              <span className="block text-[13px] font-extrabold uppercase tracking-[0.18em] text-[#0e4f4a]">NENGAPETA</span>
              <span className="block text-[11px] font-semibold text-slate-500">Inscriptions et paiements</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-5 text-[12px] font-bold text-slate-600 md:flex">
            <a href="#avantages" className="transition hover:text-[#0e4f4a]">
              Avantages
            </a>
            <a href="#roles" className="transition hover:text-[#0e4f4a]">
              Roles
            </a>
            <a href="#fonctionnalites" className="transition hover:text-[#0e4f4a]">
              Fonctionnalites
            </a>
            <a href="#faq" className="transition hover:text-[#0e4f4a]">
              FAQ
            </a>
          </nav>
          <Link
            to="/login"
            className="inline-flex h-9 items-center gap-2 rounded-[9px] bg-[#0b1f33] px-4 text-[12px] font-extrabold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-[#123554]"
          >
            Connexion
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200/80">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/nengapeta-school-hero.png')" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(244,248,247,0.98) 0%, rgba(244,248,247,0.94) 38%, rgba(244,248,247,0.62) 68%, rgba(244,248,247,0.32) 100%), linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(244,248,247,0.92) 100%)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0e4f4a] shadow-sm">
              <Sparkles size={14} />
              Institut NENGAPETA
            </div>
            <h1 className="mt-5 max-w-3xl text-[30px] font-black leading-[1.08] text-[#0b1f33] sm:text-[38px] lg:text-[48px]">
              Gestion dynamique des inscriptions et paiements scolaires
            </h1>
            <p className="mt-4 max-w-2xl text-[14px] leading-7 text-slate-600 sm:text-[15px]">
              Une application web concue pour centraliser les dossiers des eleves, organiser les inscriptions et suivre les paiements au sein d'une institution secondaire.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#0e4f4a] px-5 text-[13px] font-extrabold text-white shadow-xl shadow-emerald-950/15 transition hover:-translate-y-0.5 hover:bg-[#0b403c]"
              >
                Acceder au systeme
                <ArrowRight size={16} />
              </Link>
              <a
                href="#fonctionnalites"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-5 text-[13px] font-extrabold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-[#0e4f4a]"
              >
                Voir les fonctionnalites
              </a>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              {[
                ["Roles", "3 espaces"],
                ["Recus", "Automatiques"],
                ["Acces", "Securise"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[12px] border border-white bg-white/75 p-3 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-500">{label}</p>
                  <p className="mt-1 text-[13px] font-black text-[#0b1f33]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[18px] border border-white bg-white/90 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur">
              <div className="rounded-[14px] bg-[#0b1f33] p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-200">Tableau de bord</p>
                    <h2 className="mt-1 text-[19px] font-black">Suivi institutionnel</h2>
                  </div>
                  <LayoutDashboard size={22} className="text-emerald-200" />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    ["Eleves inscrits", "428"],
                    ["Paiements", "312"],
                    ["Solde global", "$ 8 940"],
                    ["Recus edites", "286"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[12px] bg-white/10 p-3 ring-1 ring-white/10">
                      <p className="text-[11px] font-semibold text-slate-300">{label}</p>
                      <p className="mt-2 text-[20px] font-black">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-[12px] bg-white p-4 text-slate-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-black">Derniers encaissements</p>
                      <p className="text-[11px] text-slate-500">Paiements valides par l'agent comptable</p>
                    </div>
                    <ReceiptText size={18} className="text-[#0e4f4a]" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {["Minerval T1", "Frais d'inscription", "Uniforme scolaire"].map((item, index) => (
                      <div key={item} className="flex items-center justify-between rounded-[10px] bg-slate-50 px-3 py-2">
                        <span className="text-[12px] font-bold text-slate-700">{item}</span>
                        <span className="text-[12px] font-black text-[#0e4f4a]">{index === 0 ? "$ 90" : index === 1 ? "$ 45" : "$ 30"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="avantages" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0e4f4a]">Avantages</p>
          <h2 className="mt-2 text-[24px] font-black text-[#0b1f33]">Un systeme adapte a la gestion scolaire</h2>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((item) => (
            <article key={item.title} className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/8">
              <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-emerald-50 text-[#0e4f4a]">
                <item.icon size={20} />
              </div>
              <h3 className="mt-4 text-[15px] font-black text-slate-950">{item.title}</h3>
              <p className="mt-2 text-[12px] leading-6 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="roles" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0e4f4a]">Roles et permissions</p>
              <h2 className="mt-2 text-[24px] font-black text-[#0b1f33]">Chaque utilisateur accede uniquement a son espace</h2>
              <p className="mt-3 text-[13px] leading-6 text-slate-600">
                Les permissions separent clairement les taches administratives, financieres et personnelles.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {roleCards.map((item) => (
                <article key={item.role} className="rounded-[14px] border border-slate-200 bg-[#f8fbfb] p-5">
                  <item.icon size={22} className="text-[#0e4f4a]" />
                  <h3 className="mt-4 text-[15px] font-black text-slate-950">{item.role}</h3>
                  <p className="mt-2 text-[12px] leading-6 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0e4f4a]">Fonctionnalites</p>
          <h2 className="mt-2 text-[24px] font-black text-[#0b1f33]">Outils essentiels pour l'Institut NENGAPETA</h2>
          <p className="mt-3 text-[13px] leading-6 text-slate-600">
            Le projet est organise autour des operations reelles d'une institution secondaire : dossier eleve, inscription, paiement, recu, solde et controle d'acces.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {functionalities.map((feature) => (
            <div key={feature} className="flex items-center gap-3 rounded-[12px] border border-slate-200 bg-white p-3 shadow-sm">
              <BadgeCheck size={18} className="shrink-0 text-[#0e4f4a]" />
              <span className="text-[12px] font-bold text-slate-700">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0e4f4a]">FAQ</p>
            <h2 className="mt-2 text-[24px] font-black text-[#0b1f33]">Questions frequentes</h2>
            <p className="mt-3 text-[13px] leading-6 text-slate-600">
              Les reponses ci-contre precisent le fonctionnement attendu des principaux profils.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.question} className="rounded-[14px] border border-slate-200 bg-[#f8fbfb]">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                  >
                    <span className="text-[13px] font-black text-slate-900">{faq.question}</span>
                    <ChevronDown size={18} className={`shrink-0 text-[#0e4f4a] transition ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <p className="px-4 pb-4 text-[12px] leading-6 text-slate-600">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-[#0b1f33] px-4 py-6 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-[12px] sm:flex-row sm:items-center sm:justify-between">
          <p className="font-bold">Institut NENGAPETA - Gestion des inscriptions et paiements</p>
          <p className="flex items-center gap-2 text-slate-300">
            <LockKeyhole size={14} />
            Acces securise par roles et permissions
          </p>
        </div>
      </footer>
    </main>
  );
}
