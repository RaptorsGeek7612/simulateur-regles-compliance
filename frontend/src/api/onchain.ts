import { apiFetch } from "./client";
import type { DiagnoseResult, OnchainConfig, ScenarioCase, ScenarioRunResult } from "../types/onchain";

export function getOnchainConfig() {
  return apiFetch<OnchainConfig>("/api/onchain/config");
}

export interface DiagnoseParams {
  rpcUrl?: string;
  tokenAddress?: string;
  from: string;
  to: string;
  amount: string;
}

export function diagnose(params: DiagnoseParams) {
  return apiFetch<DiagnoseResult>("/api/onchain/diagnose", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export interface ScenarioParams {
  rpcUrl?: string;
  tokenAddress?: string;
  cases: ScenarioCase[];
}

export function runScenario(params: ScenarioParams) {
  return apiFetch<ScenarioRunResult>("/api/onchain/scenario", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
