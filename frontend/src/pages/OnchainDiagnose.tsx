import { useEffect, useState, type FormEvent } from "react";
import { diagnose, getOnchainConfig } from "../api/onchain";
import { getModuleMap } from "../api/mica";
import { ApiError } from "../api/client";
import type { DiagnoseResult, Finding, OnchainConfig } from "../types/onchain";
import type { ModuleObligationLink } from "../types/mica";
import { Badge } from "../components/Badge";
import { FindingsList } from "../components/FindingsList";
import { RuleLinksForModule } from "../components/ObligationLinks";

export function OnchainDiagnose() {
  const [config, setConfig] = useState<OnchainConfig | null>(null);
  const [moduleMap, setModuleMap] = useState<ModuleObligationLink[]>([]);
  const [rpcUrl, setRpcUrl] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOnchainConfig().then(setConfig).catch(() => {});
    getModuleMap().then(setModuleMap).catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await diagnose({
        rpcUrl: rpcUrl || undefined,
        tokenAddress: tokenAddress || undefined,
        from,
        to,
        amount,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  }

  function renderExtra(f: Finding) {
    if (f.ok || !f.detail) return null;
    return <RuleLinksForModule moduleName={f.label} moduleMap={moduleMap} />;
  }

  return (
    <div className="page">
      <h1>Diagnostic on-chain</h1>
      <p className="page__intro">
        Pourquoi un transfert donné passe ou échoue : pause, solde, gel, identité ONCHAINID, puis chaque module de
        compliance branché. Lecture seule, aucune transaction envoyée.
      </p>

      <form className="form" onSubmit={onSubmit}>
        <div className="field-grid">
          <label className="field">
            <span className="field__label">RPC URL</span>
            <input
              type="url"
              placeholder={config?.hasDefaultRpc ? "(par défaut côté serveur)" : "https://…"}
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">Adresse du token</span>
            <input
              type="text"
              placeholder={config?.defaultTokenAddress ?? "0x…"}
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">De (adresse)</span>
            <input type="text" required placeholder="0x…" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="field">
            <span className="field__label">Vers (adresse)</span>
            <input type="text" required placeholder="0x…" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <label className="field">
            <span className="field__label">Montant (unités de base)</span>
            <input
              type="text"
              required
              placeholder="1000000000000000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
        </div>
        <button type="submit" className="button" disabled={loading}>
          {loading ? "Diagnostic…" : "Diagnostiquer"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <h2>
            Verdict : <Badge tone={result.allowed ? "ok" : "ko"}>{result.allowed ? "Transfert autorisé" : "Transfert refusé"}</Badge>
          </h2>
          <FindingsList findings={result.findings} renderExtra={renderExtra} />
        </div>
      )}
    </div>
  );
}
