import { FormEvent, useState } from "react";
import { LockKeyhole, School, UserRound } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { login } from "../../services/authService";

export function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin@12345");
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
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[8px] bg-white shadow-2xl shadow-teal-950/10 md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[420px] bg-[#102a2b] p-8 text-white">
          <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(45,212,191,.28),transparent_45%),radial-gradient(circle_at_20%_20%,rgba(245,158,11,.25),transparent_18rem)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-[8px] bg-teal-300 text-[#102a2b]">
                <School size={26} />
              </div>
              <div>
                <p className="heading text-2xl font-bold">Institut NENGAPETA</p>
                <p className="text-sm text-teal-50">Portail administratif et eleve</p>
              </div>
            </div>
            <div>
              <p className="heading max-w-md text-4xl font-extrabold leading-tight">Inscriptions, paiements et recus en un espace clair.</p>
              <p className="mt-4 max-w-md text-sm leading-6 text-teal-50">
                Une interface autonome, securisee et adaptee aux equipes de gestion comme aux eleves.
              </p>
            </div>
          </div>
        </div>
        <form onSubmit={submit} className="p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Connexion securisee</p>
          <h1 className="heading mt-2 text-3xl font-bold text-slate-950">Bienvenue</h1>
          <div className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Login</span>
              <span className="mt-2 flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-3">
                <UserRound size={18} className="text-teal-700" />
                <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-transparent outline-none" />
              </span>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Mot de passe</span>
              <span className="mt-2 flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-3">
                <LockKeyhole size={18} className="text-teal-700" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent outline-none" />
              </span>
            </label>
          </div>
          {error && <p className="mt-4 rounded-[8px] bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
          <button disabled={loading} className="mt-6 w-full rounded-[8px] bg-[#102a2b] px-4 py-3 font-bold text-white transition hover:bg-teal-900 disabled:opacity-60">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </section>
    </main>
  );
}

