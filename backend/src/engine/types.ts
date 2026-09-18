import type { Condition } from "./condition.js";

export type Area = "classification" | "issuer_obligations" | "casp_authorization" | "market_abuse";
export type Verdict = "applicable" | "not_applicable" | "warning";

export interface Rule {
  id: string;
  area: Area;
  title: string;
  /** Référence d'article MiCA — approximative, voir disclaimer en tête de chaque fichier rules/*.rules.ts */
  articleRef: string;
  when: Condition;
  result: {
    verdict: Verdict;
    label: string;
    obligations: string[];
    explanation: string;
  };
}

export interface RuleResult {
  ruleId: string;
  area: Area;
  title: string;
  articleRef: string;
  verdict: Verdict;
  label: string;
  obligations: string[];
  explanation: string;
}
