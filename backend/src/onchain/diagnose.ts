import { Contract, formatUnits, type JsonRpcProvider } from "ethers";
import { COMPLIANCE_ABI, MODULE_ABI, REGISTRY_ABI, TOKEN_ABI } from "./abis.js";

/**
 * Le problème que cette fonction résout.
 *
 * `canTransfer()` renvoie un booléen. Quand il renvoie false, rien n'indique
 * quelle règle a refusé. Le transfert revert avec un message générique, et le
 * développeur passe une heure à débrancher les modules un par un.
 *
 * Ce diagnostic énumère les modules branchés sur la compliance, appelle
 * `moduleCheck()` sur chacun séparément, et nomme le coupable. Il vérifie
 * aussi ce qui se passe AVANT la compliance — identité vérifiée, adresse
 * gelée, solde disponible — parce que ces trois causes représentent la
 * majorité des refus réels.
 *
 * Aucune transaction n'est envoyée. Tout est en lecture. Source unique
 * partagée par le CLI (cli.ts) et l'API HTTP (api/onchain.ts).
 */

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

export async function diagnose(
  provider: JsonRpcProvider,
  tokenAddr: string,
  from: string,
  to: string,
  amount: bigint
): Promise<DiagnoseResult> {
  const token = new Contract(tokenAddr, TOKEN_ABI, provider);
  const findings: Finding[] = [];

  const [decimals, symbol, registryAddr, complianceAddr] = await Promise.all([
    token.decimals(),
    token.symbol(),
    token.identityRegistry(),
    token.compliance(),
  ]);
  const fmt = (v: bigint) => `${formatUnits(v, decimals)} ${symbol}`;

  // --- Étage 1 : état du token ---------------------------------------------
  try {
    const paused: boolean = await token.paused();
    findings.push({ stage: "token", label: "token non en pause", ok: !paused });
  } catch {
    findings.push({ stage: "token", label: "token non en pause", ok: true, detail: "non exposé" });
  }

  // --- Étage 2 : soldes et gels --------------------------------------------
  const balance: bigint = await token.balanceOf(from);
  findings.push({
    stage: "solde",
    label: "solde suffisant",
    ok: balance >= amount,
    detail: `${fmt(balance)} disponible`,
  });

  try {
    const [fromFrozen, toFrozen, frozenTokens] = await Promise.all([
      token.isFrozen(from),
      token.isFrozen(to),
      token.getFrozenTokens(from),
    ]);
    findings.push({ stage: "gel", label: "émetteur non gelé", ok: !fromFrozen });
    findings.push({ stage: "gel", label: "destinataire non gelé", ok: !toFrozen });
    const free = balance > frozenTokens ? balance - frozenTokens : 0n;
    findings.push({
      stage: "gel",
      label: "part non gelée suffisante",
      ok: free >= amount,
      detail: `${fmt(free)} libre, ${fmt(frozenTokens)} gelé`,
    });
  } catch {
    findings.push({ stage: "gel", label: "état de gel", ok: true, detail: "illisible" });
  }

  // --- Étage 3 : identité ---------------------------------------------------
  const registry = new Contract(registryAddr, REGISTRY_ABI, provider);
  for (const [who, addr] of [
    ["émetteur", from],
    ["destinataire", to],
  ] as const) {
    try {
      const verified: boolean = await registry.isVerified(addr);
      const identity: string = await registry.identity(addr);
      const country: number = Number(await registry.investorCountry(addr));
      findings.push({
        stage: "identité",
        label: `${who} vérifié`,
        ok: verified,
        detail:
          identity === "0x0000000000000000000000000000000000000000"
            ? "aucune ONCHAINID enregistrée"
            : `ONCHAINID ${identity.slice(0, 10)}…, pays ISO ${country}`,
      });
    } catch (e: any) {
      findings.push({
        stage: "identité",
        label: `${who} vérifié`,
        ok: false,
        detail: `lecture impossible : ${e.shortMessage ?? e.message}`,
      });
    }
  }

  // --- Étage 4 : modules de conformité, un par un ---------------------------
  const compliance = new Contract(complianceAddr, COMPLIANCE_ABI, provider);
  let modules: string[] = [];
  try {
    modules = await compliance.getModules();
  } catch {
    findings.push({
      stage: "module",
      label: "énumération des modules",
      ok: false,
      detail: "getModules() indisponible sur cette version",
    });
  }

  for (const addr of modules) {
    const m = new Contract(addr, MODULE_ABI, provider);
    let label = addr.slice(0, 10) + "…";
    try {
      label = await m.name();
    } catch {
      /* module sans name() : on garde l'adresse */
    }
    try {
      const ok: boolean = await m.moduleCheck(from, to, amount, complianceAddr);
      findings.push({ stage: "module", label, ok, detail: addr });
    } catch (e: any) {
      findings.push({
        stage: "module",
        label,
        ok: false,
        detail: `moduleCheck a revert : ${e.shortMessage ?? e.message}`,
      });
    }
  }

  // --- Verdict global -------------------------------------------------------
  let compliancePasses = false;
  try {
    compliancePasses = await compliance.canTransfer(from, to, amount);
  } catch {
    /* ignoré : le détail par module est plus informatif */
  }
  findings.push({ stage: "verdict", label: "compliance.canTransfer", ok: compliancePasses });

  // compliance.canTransfer() ne vérifie que les modules de compliance — pause,
  // gel et solde disponible sont des require() séparés dans Token.transfer(),
  // absents de canTransfer(). Un transfert peut donc échouer alors que
  // canTransfer() renvoie true (confirmé contre le contrat T-REX de référence :
  // voir contracts/token/Token.sol#transfer chez TokenySolutions/T-REX).
  // Le verdict global doit donc dépendre de TOUS les findings, pas du seul
  // appel canTransfer().
  const allowed = findings.every((f) => f.ok);

  return { allowed, findings };
}
