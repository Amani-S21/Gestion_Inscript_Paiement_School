import { KeyRound, Layers3, School, Settings2, ShieldCheck, UsersRound } from "lucide-react";

const modules = [
  { title: "Annees scolaires", icon: School },
  { title: "Sections, options, classes", icon: Layers3 },
  { title: "Frais scolaires", icon: Settings2 },
  { title: "Utilisateurs", icon: UsersRound },
  { title: "Roles et permissions", icon: ShieldCheck },
  { title: "Securite et sauvegardes", icon: KeyRound },
];

export function AdministrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading text-3xl font-bold text-slate-950">Administration</h2>
        <p className="mt-1 text-slate-500">Parametres systeme, structure scolaire et controle des permissions.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <div className="surface rounded-[8px] p-5" key={module.title}>
            <module.icon className="text-teal-700" />
            <h3 className="heading mt-4 text-lg font-bold text-slate-950">{module.title}</h3>
            <p className="mt-2 text-sm text-slate-500">Gestion protegee par role et permission.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

