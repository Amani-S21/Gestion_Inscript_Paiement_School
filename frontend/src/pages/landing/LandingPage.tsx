import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  ChevronDown,
  CreditCard,
  FileCheck2,
  GraduationCap,
  Landmark,
  LockKeyhole,
  School,
  ShieldCheck,
  Sparkles,
  UserCog,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getPublicMarketingMedia } from "../../services/adminService";

const advantages = [
  {
    title: "Inscriptions maîtrisées",
    description: "Création des élèves, inscriptions, réinscriptions et suivi des classes dans un même espace.",
    icon: BookOpenCheck,
  },
  {
    title: "Paiements fiables",
    description: "Encaissements tracés, soldes calculés automatiquement et reçus générés sans ressaisie.",
    icon: CreditCard,
  },
  {
    title: "Accès par rôle",
    description: "Administrateur, agent comptable et élève disposent chacun d'un espace limité à leurs droits.",
    icon: ShieldCheck,
  },
  {
    title: "Dossiers consultables",
    description: "Chaque élève retrouve son profil, son inscription, ses frais, ses paiements et son état financier.",
    icon: FileCheck2,
  },
];

const roleCards = [
  {
    role: "Administrateur",
    text: "Configure les années scolaires, sections, options, classes, frais, utilisateurs, rôles et permissions.",
    icon: UserCog,
  },
  {
    role: "Agent comptable",
    text: "Enregistre les paiements, consulte les soldes, édite les reçus et suit les encaissements de l'établissement.",
    icon: Landmark,
  },
  {
    role: "Élève",
    text: "Consulte son profil, son inscription, ses paiements, son solde, ses reçus et ses informations personnelles.",
    icon: GraduationCap,
  },
];

const functionalities = [
  "Gestion des élèves avec photo de profil",
  "Options, sections, classes et années scolaires",
  "Inscriptions et réinscriptions",
  "Configuration des frais scolaires",
  "Paiements, soldes et historiques",
  "Génération automatique des reçus",
  "Tableaux de bord par profil",
  "Rôles, permissions et sécurité",
];

const fallbackMedia = [
  {
    title: "Vie scolaire organisée",
    description: "Une école vivante avec un encadrement structuré.",
    image_url: "/images/nengapeta-gallery/vie-scolaire.jpg",
  },
  {
    title: "Encadrement pédagogique",
    description: "Des élèves accompagnés dans leur parcours scolaire.",
    image_url: "/images/nengapeta-gallery/electricite-pratique.jpg",
  },
  {
    title: "Activités éducatives",
    description: "Des espaces de formation orientés vers la réussite.",
    image_url: "/images/nengapeta-gallery/atelier-cuisine.jpg",
  },
];

const reasons = [
  { title: "Encadrement sérieux", image: "/images/nengapeta-gallery/laboratoire-sciences.jpg" },
  { title: "Suivi des élèves", image: "/images/nengapeta-gallery/vie-scolaire.jpg" },
  { title: "Communication claire", image: "/images/nengapeta-gallery/electricite-pratique.jpg" },
  { title: "Paiements tracés", image: "/images/nengapeta-gallery/atelier-cuisine.jpg" },
  { title: "Reçus disponibles", image: "/images/nengapeta-gallery/laboratoire-sciences.jpg" },
  { title: "Espace élève", image: "/images/nengapeta-gallery/vie-scolaire.jpg" },
  { title: "Gestion moderne", image: "/images/nengapeta-gallery/electricite-pratique.jpg" },
  { title: "Archives propres", image: "/images/nengapeta-gallery/agriculture-pratique.jpg" },
  { title: "Rapports professionnels", image: "/images/nengapeta-gallery/atelier-cuisine.jpg" },
  { title: "Administration structurée", image: "/images/nengapeta-gallery/electricite-pratique.jpg" },
];

const faqs = [
  {
    question: "Qui peut créer un élève dans le système ?",
    answer: "L'administrateur dispose des droits de création et de gestion des élèves. Il peut aussi configurer les classes, options, sections, frais et utilisateurs du système.",
  },
  {
    question: "Le comptable peut-il modifier les paramètres administratifs ?",
    answer: "Non. L'agent comptable travaille sur le volet financier : enregistrement des paiements, vérification des soldes, édition des reçus et consultation des historiques autorisés.",
  },
  {
    question: "Que voit un élève après connexion ?",
    answer: "L'élève accède uniquement à ses propres données : profil, inscription, classe, option, frais, paiements, reçus et solde restant.",
  },
  {
    question: "Les reçus de paiement sont-ils générés automatiquement ?",
    answer: "Oui. Après l'enregistrement d'un paiement, le système prépare un reçu numéroté et rattaché à l'élève, au frais concerné et à l'agent qui a réalisé l'opération.",
  },
];

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [mediaIndex, setMediaIndex] = useState(0);
  const mediaQuery = useQuery({ queryKey: ["public-marketing-media"], queryFn: getPublicMarketingMedia });
  const publicMedia = (mediaQuery.data?.length ? mediaQuery.data : fallbackMedia) as Array<{ id?: number; title: string; description?: string; image_url: string }>;
  const currentMedia = publicMedia[mediaIndex % publicMedia.length];

  useEffect(() => {
    if (publicMedia.length <= 1) return;
    const timer = window.setInterval(() => {
      setMediaIndex((index) => (index + 1) % publicMedia.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [publicMedia.length]);

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
            <a href="#avantages" className="transition hover:text-[#0e4f4a]">Avantages</a>
            <a href="#roles" className="transition hover:text-[#0e4f4a]">Rôles</a>
            <a href="#fonctionnalites" className="transition hover:text-[#0e4f4a]">Fonctionnalités</a>
            <a href="#photos" className="transition hover:text-[#0e4f4a]">Photos</a>
            <a href="#faq" className="transition hover:text-[#0e4f4a]">FAQ</a>
          </nav>
          <Link to="/login" className="inline-flex h-9 items-center gap-2 rounded-[9px] bg-[#0b1f33] px-4 text-[12px] font-extrabold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-[#123554]">
            Connexion
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden border-b border-slate-200/80">
        <img src="/images/nengapeta-school-hero.png" alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-100 brightness-[1.16] contrast-[1.03] saturate-[1.06] lg:object-right" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.88) 40%, rgba(255,255,255,0.48) 66%, rgba(255,255,255,0.1) 100%), linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(244,248,247,0.68) 100%)" }} />
        <div className="relative mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl gap-8 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0e4f4a] shadow-sm">
              <Sparkles size={14} />
              Institut NENGAPETA
            </div>
            <h1 className="mt-5 max-w-3xl text-[30px] font-black leading-[1.08] text-[#0b1f33] sm:text-[38px] lg:text-[48px]">
              Gestion dynamique des inscriptions et paiements scolaires
            </h1>
            <p className="mt-4 max-w-2xl text-[14px] leading-7 text-slate-600 sm:text-[15px]">
              Une application web conçue pour centraliser les dossiers des élèves, organiser les inscriptions et suivre les paiements au sein d'une institution secondaire.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#0e4f4a] px-5 text-[13px] font-extrabold text-white shadow-xl shadow-emerald-950/15 transition hover:-translate-y-0.5 hover:bg-[#0b403c]">
                Accéder au système
                <ArrowRight size={16} />
              </Link>
              <a href="#fonctionnalites" className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-5 text-[13px] font-extrabold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-[#0e4f4a]">
                Voir les fonctionnalités
              </a>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              {[["Rôles", "3 espaces"], ["Reçus", "Automatiques"], ["Accès", "Sécurisé"]].map(([label, value]) => (
                <div key={label} className="rounded-[12px] border border-white bg-white/75 p-3 shadow-sm">
                  <p className="text-[11px] font-bold text-slate-500">{label}</p>
                  <p className="mt-1 text-[13px] font-black text-[#0b1f33]">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </section>

      <section id="avantages" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0e4f4a]">Avantages</p>
          <h2 className="mt-2 text-[24px] font-black text-[#0b1f33]">Un système adapté à la gestion scolaire</h2>
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
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0e4f4a]">Rôles et permissions</p>
              <h2 className="mt-2 text-[24px] font-black text-[#0b1f33]">Chaque utilisateur accède uniquement à son espace</h2>
              <p className="mt-3 text-[13px] leading-6 text-slate-600">Les permissions séparent clairement les tâches administratives, financières et personnelles.</p>
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
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0e4f4a]">Fonctionnalités</p>
          <h2 className="mt-2 text-[24px] font-black text-[#0b1f33]">Outils essentiels pour l'Institut NENGAPETA</h2>
          <p className="mt-3 text-[13px] leading-6 text-slate-600">
            Le projet est organisé autour des opérations réelles d'une institution secondaire : dossier élève, inscription, paiement, reçu, solde et contrôle d'accès.
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

      <section id="photos" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0e4f4a]">Photos publicitaires</p>
              <h2 className="mt-2 text-[24px] font-black text-[#0b1f33]">La vie de l'Institut NENGAPETA</h2>
            </div>
          </div>
          <div className="mt-6 overflow-hidden rounded-[14px] border border-slate-200 bg-[#f8fbfb] shadow-sm">
            <article key={currentMedia.id ?? currentMedia.title} className="grid md:grid-cols-[1.15fr_0.85fr]">
              <img
                src={currentMedia.image_url}
                alt=""
                className="h-[360px] w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = "/images/nengapeta-school-hero.png";
                }}
              />
              <div className="flex flex-col justify-center p-6 md:p-8">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0e4f4a]">Publication {mediaIndex + 1}</p>
                <h3 className="mt-3 text-[24px] font-black text-[#0b1f33]">{currentMedia.title}</h3>
                <p className="mt-3 text-[14px] leading-7 text-slate-600">{currentMedia.description || "Photo publicitaire de l'Institut NENGAPETA."}</p>
                <div className="mt-6 flex gap-2">
                  {publicMedia.map((item, index) => (
                    <button
                      key={item.id ?? item.title}
                      type="button"
                      onClick={() => setMediaIndex(index)}
                      className={`h-2.5 rounded-full transition ${index === mediaIndex % publicMedia.length ? "w-8 bg-[#0e4f4a]" : "w-2.5 bg-slate-300"}`}
                      title={`Afficher ${item.title}`}
                    />
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0e4f4a]">10 raisons</p>
          <h2 className="mt-2 text-[24px] font-black text-[#0b1f33]">Pourquoi rejoindre NENGAPETA</h2>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {reasons.map((reason, index) => (
            <div key={reason.title} className="overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-sm">
              <img
                src={reason.image}
                alt=""
                className="h-28 w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = "/images/nengapeta-school-hero.png";
                }}
              />
              <div className="p-4">
                <p className="text-[11px] font-black text-[#0e4f4a]">Raison {index + 1}</p>
                <p className="mt-1 text-[13px] font-bold text-slate-800">{reason.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0e4f4a]">FAQ</p>
            <h2 className="mt-2 text-[24px] font-black text-[#0b1f33]">Questions fréquentes</h2>
            <p className="mt-3 text-[13px] leading-6 text-slate-600">Les réponses ci-contre précisent le fonctionnement attendu des principaux profils.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.question} className="rounded-[14px] border border-slate-200 bg-[#f8fbfb]">
                  <button type="button" onClick={() => setOpenFaq(isOpen ? -1 : index)} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left">
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

      <footer className="border-t border-slate-200 bg-[#0b1f33] px-4 py-8 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 text-[12px] md:grid-cols-3">
          <div>
            <p className="font-black">A propos</p>
            <p className="mt-2 leading-6 text-slate-300">Historique, photos et fichiers de présentation de l'Institut NENGAPETA.</p>
          </div>
          <div>
            <p className="font-black">Contactez-nous</p>
            <p className="mt-2 leading-6 text-slate-300">Téléphone des autorités, Facebook, WhatsApp, Instagram, Telegram, TikTok et YouTube.</p>
          </div>
          <div>
            <p className="font-black">Dernier mot</p>
            <p className="mt-2 flex items-center gap-2 text-slate-300">
              <LockKeyhole size={14} />
              Developed by Ir Jean de Dieu BAG, copyright 2026
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
