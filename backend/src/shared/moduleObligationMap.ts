/**
 * Lien indicatif entre les modules de compliance ERC-3643 (volet on-chain,
 * noms tels que renvoyés par `module.name()` dans onchain/diagnose.ts) et
 * les règles MiCA qu'ils traduisent techniquement (identifiants de
 * `backend/src/rules/*.rules.ts`).
 *
 * Ce n'est PAS une correspondance juridique garantie — un module peut
 * implémenter partiellement une obligation, ou l'implémenter au-delà de ce
 * que MiCA exige. À maintenir à jour manuellement : renommer une règle sans
 * mettre à jour cette table casse le lien silencieusement (voir
 * CONTRIBUTING.md).
 */
export interface ModuleObligationLink {
  /** Nom du module tel qu'exposé par `moduleCheck()`/`name()` on-chain. */
  moduleName: string;
  /** Identifiants de règles MiCA (backend/src/rules/*.rules.ts) que ce module traduit. */
  ruleIds: string[];
  note: string;
}

export const MODULE_OBLIGATION_MAP: ModuleObligationLink[] = [
  {
    moduleName: "MaxHolderCountModule",
    ruleIds: ["issuer-authorization-art-exempt", "issuer-authorization-art"],
    note:
      "Plafonne le nombre de porteurs on-chain : traduit techniquement les seuils d'exemption d'agrément (\"moins de 150 personnes par État membre\") de l'art. 16.",
  },
  {
    moduleName: "MinimumTicketModule",
    ruleIds: ["issuer-authorization-art-exempt", "issuer-authorization-art"],
    note:
      "Impose un montant minimal par souscription : traduit le critère de ticket minimum (100 000 €) des dispenses d'agrément de l'art. 16.",
  },
  {
    moduleName: "LockupModule",
    ruleIds: ["issuer-reserve-of-assets"],
    note:
      "Bloque le transfert pendant une période donnée, utilisé typiquement pour respecter des engagements de conservation liés à la réserve d'actifs ou à un lock-up contractuel, pas une obligation MiCA directe en tant que telle.",
  },
  {
    moduleName: "BlackoutPeriodModule",
    ruleIds: ["market-abuse-insider-dealing", "market-abuse-manipulation"],
    note:
      "Interdit les transferts pendant une fenêtre donnée (ex. avant publication de résultats) : traduction technique des interdictions d'abus de marché du Titre VI.",
  },
  {
    moduleName: "ClaimRequiredModule",
    ruleIds: ["casp-general-conduct", "issuer-general-duties"],
    note:
      "Exige une créance ONCHAINID valide avant transfert : traduit les obligations de connaissance du porteur/client (KYC) sous-jacentes aux obligations générales d'émetteur et de CASP.",
  },
];

export function findLinksForRule(ruleId: string): ModuleObligationLink[] {
  return MODULE_OBLIGATION_MAP.filter((link) => link.ruleIds.includes(ruleId));
}

export function findLinksForModule(moduleName: string): ModuleObligationLink | undefined {
  return MODULE_OBLIGATION_MAP.find((link) => link.moduleName === moduleName);
}
