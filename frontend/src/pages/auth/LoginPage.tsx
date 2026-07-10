import { FormEvent, useState } from "react";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, School, ShieldCheck, UserRound } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { login } from "../../services/authService";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      await refresh();
      navigate(params.get("from") || "/app", { replace: true });
    } catch {
      setError("Identifiants incorrects ou compte desactive.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative grid min-h-[100dvh] place-items-center overflow-x-hidden bg-[#eef5f6] px-2 py-3 sm:px-4 sm:py-5 md:h-[100dvh] md:min-h-0 md:overflow-hidden md:py-2">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(14,165,233,0.13),transparent_24rem),radial-gradient(circle_at_90%_86%,rgba(16,185,129,0.16),transparent_23rem),linear-gradient(135deg,#eef5f6_0%,#f8fbfb_52%,#eef3ff_100%)]" />
      <section className="relative grid min-w-0 w-full max-w-[min(56rem,calc(100vw-1rem))] overflow-hidden rounded-[16px] border border-white/80 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur md:h-[calc(100dvh-1rem)] md:max-h-[590px] md:min-h-0 md:grid-cols-[0.9fr_1.1fr] lg:max-h-[610px]">
        <div className="relative hidden bg-[#0b1f33] p-[clamp(1rem,2.2vw,1.75rem)] text-white md:block">
          <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(14,165,233,.26),transparent_42%),radial-gradient(circle_at_20%_18%,rgba(16,185,129,.28),transparent_15rem),radial-gradient(circle_at_84%_82%,rgba(245,158,11,.20),transparent_14rem)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-[clamp(2rem,3.4vw,2.5rem)] w-[clamp(2rem,3.4vw,2.5rem)] place-items-center rounded-[10px] bg-emerald-300 text-[#0b1f33] shadow-lg shadow-slate-950/20">
                <School className="h-[clamp(1.1rem,2vw,1.5rem)] w-[clamp(1.1rem,2vw,1.5rem)]" />
              </div>
              <div className="min-w-0">
                <p className="heading text-[clamp(1rem,1.55vw,1.25rem)] font-bold leading-tight">Institut NENGAPETA</p>
                <p className="text-[clamp(0.65rem,1vw,0.75rem)] text-sky-50/75">Gestion scolaire integree</p>
              </div>
            </div>
            <div>
              <div className="mb-[clamp(0.6rem,1.5vw,1rem)] inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[clamp(0.65rem,1vw,0.75rem)] font-semibold text-emerald-50 ring-1 ring-white/15">
                <ShieldCheck className="h-[clamp(0.75rem,1.2vw,0.875rem)] w-[clamp(0.75rem,1.2vw,0.875rem)]" />
                Acces securise
              </div>
              <p className="heading max-w-md text-[clamp(1.35rem,2.7vw,2rem)] font-extrabold leading-tight">Gestion des inscriptions et paiements.</p>
              <p className="mt-[clamp(0.5rem,1.2vw,0.75rem)] max-w-sm text-[clamp(0.7rem,1.05vw,0.8125rem)] leading-[1.65] text-sky-50/75">
                Une interface fiable pour suivre les eleves, les frais, les paiements et les recus.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["Eleves", "Paiements", "Recus"].map((item) => (
                <div key={item} className="rounded-[10px] bg-white/10 px-2 py-[clamp(0.4rem,1vw,0.5rem)] text-center text-[clamp(0.65rem,1vw,0.75rem)] font-semibold text-white/80 ring-1 ring-white/10">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
        <form onSubmit={submit} className="flex min-h-0 min-w-0 flex-col justify-center p-[clamp(0.8rem,4vw,2rem)]">
          <div className="mb-[clamp(0.75rem,3vw,1rem)] flex min-w-0 items-center gap-2.5 md:hidden">
            <div className="grid h-[clamp(2rem,10vw,2.25rem)] w-[clamp(2rem,10vw,2.25rem)] shrink-0 place-items-center rounded-[10px] bg-[#0b1f33] text-emerald-200">
              <School className="h-[clamp(1.05rem,5vw,1.25rem)] w-[clamp(1.05rem,5vw,1.25rem)]" />
            </div>
            <div className="min-w-0">
              <p className="heading break-words text-[clamp(0.95rem,5vw,1.125rem)] font-bold leading-tight text-slate-950">Institut NENGAPETA</p>
              <p className="text-[clamp(0.65rem,3.2vw,0.75rem)] font-medium text-slate-500">Gestion scolaire integree</p>
            </div>
          </div>
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-[clamp(0.55rem,2vw,0.75rem)] py-1 text-[clamp(0.62rem,2.7vw,0.75rem)] font-bold uppercase tracking-[0.12em] text-emerald-700">
            <ShieldCheck className="h-[clamp(0.75rem,3.5vw,0.875rem)] w-[clamp(0.75rem,3.5vw,0.875rem)]" />
            Connexion
          </p>
          <h1 className="heading mt-[clamp(0.4rem,1.5vw,0.5rem)] text-[clamp(1.15rem,6vw,1.5rem)] font-bold text-slate-950">Bienvenue</h1>
          <div className="mt-[clamp(0.75rem,3.5vw,1.25rem)] space-y-[clamp(0.65rem,2.8vw,0.85rem)]">
            <label className="block">
              <span className="text-[clamp(0.72rem,3vw,0.8125rem)] font-semibold text-slate-700">Login</span>
              <span className="mt-1.5 flex h-[clamp(2.35rem,10vw,2.75rem)] min-w-0 items-center gap-[clamp(0.5rem,2.5vw,0.75rem)] rounded-[10px] border border-slate-200 bg-slate-50 px-[clamp(0.55rem,2.5vw,0.75rem)] transition focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50">
                <UserRound className="h-[clamp(0.9rem,4vw,1rem)] w-[clamp(0.9rem,4vw,1rem)] shrink-0 text-emerald-700" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="Votre identifiant"
                  className="min-w-0 flex-1 bg-transparent text-[clamp(0.75rem,3.2vw,0.8125rem)] text-slate-900 outline-none placeholder:text-slate-400"
                />
              </span>
            </label>
            <label className="block">
              <span className="text-[clamp(0.72rem,3vw,0.8125rem)] font-semibold text-slate-700">Mot de passe</span>
              <span className="mt-1.5 flex h-[clamp(2.35rem,10vw,2.75rem)] min-w-0 items-center gap-[clamp(0.5rem,2.5vw,0.75rem)] rounded-[10px] border border-slate-200 bg-slate-50 px-[clamp(0.55rem,2.5vw,0.75rem)] transition focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50">
                <LockKeyhole className="h-[clamp(0.9rem,4vw,1rem)] w-[clamp(0.9rem,4vw,1rem)] shrink-0 text-emerald-700" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Votre mot de passe"
                  className="min-w-0 flex-1 bg-transparent text-[clamp(0.75rem,3.2vw,0.8125rem)] text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="grid h-[clamp(1.65rem,7vw,2rem)] w-[clamp(1.65rem,7vw,2rem)] shrink-0 place-items-center rounded-[8px] text-slate-500 transition hover:bg-white hover:text-emerald-800"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="h-[clamp(0.9rem,4vw,1rem)] w-[clamp(0.9rem,4vw,1rem)]" /> : <Eye className="h-[clamp(0.9rem,4vw,1rem)] w-[clamp(0.9rem,4vw,1rem)]" />}
                </button>
              </span>
            </label>
          </div>
          {error && <p className="mt-[clamp(0.65rem,2.8vw,1rem)] rounded-[10px] bg-rose-50 px-4 py-2.5 text-[clamp(0.72rem,3vw,0.8125rem)] font-semibold text-rose-700">{error}</p>}
          <button disabled={loading} className="mt-[clamp(0.8rem,3vw,1rem)] h-[clamp(2.4rem,10vw,2.75rem)] w-full rounded-[10px] bg-[#0b1f33] px-4 text-[clamp(0.75rem,3vw,0.8125rem)] font-bold text-white shadow-lg shadow-slate-950/15 transition hover:bg-[#123554] disabled:opacity-60">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          <Link
            to="/"
            className="mt-[clamp(0.55rem,2.5vw,0.75rem)] inline-flex w-full items-center justify-center gap-1.5 text-[clamp(0.7rem,2.8vw,0.75rem)] font-semibold text-slate-500 transition hover:text-emerald-800"
          >
            <ArrowLeft className="h-[clamp(0.75rem,3vw,0.8125rem)] w-[clamp(0.75rem,3vw,0.8125rem)]" />
            Retour a l'accueil
          </Link>
        </form>
      </section>
    </main>
  );
}
