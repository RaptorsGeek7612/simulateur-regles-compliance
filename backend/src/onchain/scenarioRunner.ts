import type { JsonRpcProvider } from "ethers";
import { diagnose } from "./diagnose.js";

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

/**
 * Rejoue diagnose() sur une liste de cas et compare au résultat attendu.
 * C'est une suite de non-régression pour les RÈGLES DE CONFORMITÉ, pas pour
 * le code : chaque cas est un scénario métier qu'un émetteur a validé
 * ("un investisseur allemand sous 100 000 € ne doit pas pouvoir entrer").
 */
export async function runScenarios(
  provider: JsonRpcProvider,
  tokenAddr: string,
  cases: ScenarioCase[]
): Promise<ScenarioRunResult> {
  const results: ScenarioCaseResult[] = [];

  for (const c of cases) {
    const { allowed, findings } = await diagnose(provider, tokenAddr, c.from, c.to, BigInt(c.amount));
    const expected = c.expect === "allow";
    const pass = allowed === expected;
    const blockers = findings.filter((f) => !f.ok && f.stage !== "verdict").map((b) => b.label);

    results.push({ name: c.name, pass, allowed, expected, blockers });
  }

  const passed = results.filter((r) => r.pass).length;
  return { results, summary: { passed, total: results.length } };
}
