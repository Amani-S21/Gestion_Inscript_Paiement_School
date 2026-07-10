import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, School, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
      navigate(params.get("from") || "/", { replace: true });
    } catch {
      setError("Identifiants incorrects ou compte desactive.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(20,184,166,0.15),transparent_28rem),radial-gradient(circle_at_88%_86%,rgba(245,158,11,0.13),transparent_24rem)]" />
      <section className="relative grid w-full max-w-4xl overflow-hidden rounded-[14px] border border-white/70 bg-white/90 shadow-2xl shadow-teal-950/10 backdrop-blur md:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden min-h-[500px] bg-[#102a2b] p-8 text-white md:block">
          <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(45,212,191,.26),transparent_46%),radial-gradient(circle_at_18%_18%,rgba(245,158,11,.23),transparent_17rem)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-[10px] bg-teal-300 text-[#102a2b] shadow-lg shadow-teal-950/20">
                <School size={24} />
              </div>
              <div>
                <p className="heading text-xl font-bold">Institut NENGAPETA</p>
                <p className="text-xs text-teal-50/80">Portail administratif et eleve</p>
              </div>
            </div>
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-teal-50 ring-1 ring-white/15">
                <ShieldCheck size={14} />
                Acces securise
              </div>
              <p className="heading max-w-md text-3xl font-extrabold leading-tight">Inscriptions, paiements et recus en un espace clair.</p>
              <p className="mt-4 max-w-sm text-[13px] leading-6 text-teal-50/80">
                Une interface autonome, securisee et adaptee aux equipes de gestion comme aux eleves.
              </p>
            </div>
          </div>
        </div>
        <form onSubmit={submit} className="p-6 sm:p-8 md:p-10">
          <div className="md:hidden mb-7 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-[10px] bg-[#102a2b] text-teal-200">
              <School size={23} />
            </div>
            <div>
              <p className="heading text-lg font-bold text-slate-950">Institut NENGAPETA</p>
              <p className="text-xs text-slate-500">Portail administratif et eleve</p>
            </div>
          </div>
          <p className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
            <ShieldCheck size={14} />
            Connexion
          </p>
          <h1 className="heading mt-4 text-2xl font-bold text-slate-950">Bienvenue</h1>
          <p className="mt-2 max-w-sm text-[13px] leading-6 text-slate-500">
            Entrez vos informations pour acceder a votre espace de travail.
          </p>
          <div className="mt-7 space-y-4">
            <label className="block">
              <span className="text-[13px] font-semibold text-slate-700">Login</span>
              <span className="mt-2 flex h-11 items-center gap-3 rounded-[10px] border border-slate-200 bg-slate-50 px-3 transition focus-within:border-teal-700 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-50">
                <UserRound size={17} className="text-teal-700" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="Votre identifiant"
                  className="w-full bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
                />
              </span>
            </label>
            <label className="block">
              <span className="text-[13px] font-semibold text-slate-700">Mot de passe</span>
              <span className="mt-2 flex h-11 items-center gap-3 rounded-[10px] border border-slate-200 bg-slate-50 px-3 transition focus-within:border-teal-700 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-50">
                <LockKeyhole size={17} className="text-teal-700" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Votre mot de passe"
                  className="w-full bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] text-slate-500 transition hover:bg-white hover:text-teal-800"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
          </div>
          {error && <p className="mt-4 rounded-[10px] bg-rose-50 px-4 py-3 text-[13px] font-semibold text-rose-700">{error}</p>}
          <button disabled={loading} className="mt-6 h-11 w-full rounded-[10px] bg-[#102a2b] px-4 text-[13px] font-bold text-white shadow-lg shadow-teal-950/15 transition hover:bg-teal-900 disabled:opacity-60">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </section>
    </main>
  );
}
