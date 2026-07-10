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
    <main className="relative grid h-screen place-items-center overflow-hidden bg-[#eef5f6] px-3 py-3">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(14,165,233,0.13),transparent_24rem),radial-gradient(circle_at_90%_86%,rgba(16,185,129,0.16),transparent_23rem),linear-gradient(135deg,#eef5f6_0%,#f8fbfb_52%,#eef3ff_100%)]" />
      <section className="relative grid h-full max-h-[620px] w-full max-w-4xl overflow-hidden rounded-[16px] border border-white/80 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur md:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden bg-[#0b1f33] p-7 text-white md:block">
          <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(14,165,233,.26),transparent_42%),radial-gradient(circle_at_20%_18%,rgba(16,185,129,.28),transparent_15rem),radial-gradient(circle_at_84%_82%,rgba(245,158,11,.20),transparent_14rem)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-emerald-300 text-[#0b1f33] shadow-lg shadow-slate-950/20">
                <School size={24} />
              </div>
              <div>
                <p className="heading text-xl font-bold">Institut NENGAPETA</p>
                <p className="text-xs text-sky-50/75">Gestion scolaire integree</p>
              </div>
            </div>
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-50 ring-1 ring-white/15">
                <ShieldCheck size={14} />
                Acces securise
              </div>
              <p className="heading max-w-md text-[2rem] font-extrabold leading-tight">Gestion des inscriptions et paiements.</p>
              <p className="mt-3 max-w-sm text-[13px] leading-6 text-sky-50/75">
                Une interface fiable pour suivre les eleves, les frais, les paiements et les recus.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["Eleves", "Paiements", "Recus"].map((item) => (
                <div key={item} className="rounded-[10px] bg-white/10 px-3 py-2 text-center text-xs font-semibold text-white/80 ring-1 ring-white/10">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
        <form onSubmit={submit} className="flex min-h-0 flex-col justify-center p-5 sm:p-7 md:p-9">
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#0b1f33] text-emerald-200">
              <School size={23} />
            </div>
            <div>
              <p className="heading text-lg font-bold text-slate-950">Institut NENGAPETA</p>
              <p className="text-xs text-slate-500">Gestion scolaire integree</p>
            </div>
          </div>
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
            <ShieldCheck size={14} />
            Connexion
          </p>
          <h1 className="heading mt-3 text-2xl font-bold text-slate-950">Bienvenue</h1>
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-[13px] font-semibold text-slate-700">Login</span>
              <span className="mt-2 flex h-11 items-center gap-3 rounded-[10px] border border-slate-200 bg-slate-50 px-3 transition focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50">
                <UserRound size={17} className="text-emerald-700" />
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
              <span className="mt-2 flex h-11 items-center gap-3 rounded-[10px] border border-slate-200 bg-slate-50 px-3 transition focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50">
                <LockKeyhole size={17} className="text-emerald-700" />
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
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] text-slate-500 transition hover:bg-white hover:text-emerald-800"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
          </div>
          {error && <p className="mt-4 rounded-[10px] bg-rose-50 px-4 py-3 text-[13px] font-semibold text-rose-700">{error}</p>}
          <button disabled={loading} className="mt-6 h-11 w-full rounded-[10px] bg-[#0b1f33] px-4 text-[13px] font-bold text-white shadow-lg shadow-slate-950/15 transition hover:bg-[#123554] disabled:opacity-60">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </section>
    </main>
  );
}
