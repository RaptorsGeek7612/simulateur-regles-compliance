import type { ModuleObligationLink } from "../types/mica";

/** Modules on-chain qui traduisent une règle MiCA donnée (utilisé côté wizard MiCA). */
export function ModuleLinksForRule({ ruleId, moduleMap }: { ruleId: string; moduleMap: ModuleObligationLink[] }) {
  const links = moduleMap.filter((link) => link.ruleIds.includes(ruleId));
  if (links.length === 0) return null;
  return (
    <div className="obligation-links">
      <div className="obligation-links__title">Modules on-chain liés</div>
      {links.map((link) => (
        <div key={link.moduleName} className="obligation-links__item">
          <code>{link.moduleName}</code>
          <p>{link.note}</p>
        </div>
      ))}
    </div>
  );
}

/** Règles MiCA traduites par un module on-chain donné (utilisé côté diagnostic on-chain). */
export function RuleLinksForModule({ moduleName, moduleMap }: { moduleName: string; moduleMap: ModuleObligationLink[] }) {
  const link = moduleMap.find((l) => l.moduleName === moduleName);
  if (!link) return null;
  return (
    <div className="obligation-links obligation-links--inline">
      <span className="obligation-links__title">Obligation MiCA traduite :</span> {link.note}
    </div>
  );
}
