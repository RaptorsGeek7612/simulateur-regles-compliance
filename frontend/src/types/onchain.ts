export type Stage = "token" | "solde" | "gel" | "identité" | "module" | "verdict";

export interface Finding {
  stage: Stage;
  label: string;
  ok: boolean;
  detail?: string;
}

export interface DiagnoseResult {
  allowed: boolean;
  findings: Finding[];
}

export interface ScenarioCase {
  name: string;
  from: string;
  to: string;
  amount: string;
  expect: "allow" | "deny";
}

export interface ScenarioCaseResult {
  name: string;
  pass: boolean;
  allowed: boolean;
  expected: boolean;
  blockers: string[];
}

export interface ScenarioRunResult {
  results: ScenarioCaseResult[];
  summary: { passed: number; total: number };
}

export interface OnchainConfig {
  hasDefaultRpc: boolean;
  defaultTokenAddress: string | null;
}

export const STAGE_LABELS: Record<Stage, string> = {
  token: "État du token",
  solde: "Solde",
  gel: "Gel",
  identité: "Identité (ONCHAINID)",
  module: "Modules de compliance",
  verdict: "Verdict",
};

export const STAGE_ORDER: Stage[] = ["token", "solde", "gel", "identité", "module", "verdict"];
