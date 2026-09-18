import { useState, type ChangeEvent, type FormEvent } from "react";
import { runScenario } from "../api/onchain";
import { ApiError } from "../api/client";
import type { ScenarioCase, ScenarioRunResult } from "../types/onchain";
import { Badge } from "../components/Badge";

const EXAMPLE: ScenarioCase[] = [
  {
    name: "porteur verifie vers porteur verifie",
    from: "0x1111111111111111111111111111111111111111",
    to: "0x2222222222222222222222222222222222222222",
    amount: "1000000000000000000",
    expect: "allow",
  },
  {
    name: "vers adresse sans ONCHAINID",
    from: "0x1111111111111111111111111111111111111111",
    to: "0x3333333333333333333333333333333333333333",
    amount: "1000000000000000000",
    expect: "deny",
  },
  {
    name: "sous le ticket minimum",
    from: "0x1111111111111111111111111111111111111111",
    to: "0x2222222222222222222222222222222222222222",
    amount: "1",
    expect: "deny",
  },
];

export function OnchainScenario() {
  const [rpcUrl, setRpcUrl] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [casesText, setCasesText] = useState(JSON.stringify(EXAMPLE, null, 2));
  const [result, setResult] = useState<ScenarioRunResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(setCasesText);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    let cases: ScenarioCase[];
    try {
      cases = JSON.parse(casesText);
      if (!Array.isArray(cases) || cases.length === 0) throw new Error("le fichier doit contenir un tableau non vide de cas");
    } catch (e) {
      setError(`JSON invalide : ${e instanceof Error ? e.message : String(e)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await runScenario({ rpcUrl: rpcUrl || undefined, tokenAddress: tokenAddress || undefined, cases });
      setResult(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Rejeu de scénarios</h1>
      <p className="page__intro">
        Rejoue le diagnostic on-chain sur une liste de cas et compare au résultat attendu : non-régression pour les
        règles de conformité, pas pour le code.
      </p>

      <form className="form" onSubmit={onSubmit}>
        <div className="field-grid">
          <label className="field">
            <span className="field__label">RPC URL</span>
            <input type="url" placeholder="(par défaut côté serveur)" value={rpcUrl} onChange={(e) => setRpcUrl(e.target.value)} />
          </label>
          <label className="field">
            <span className="field__label">Adresse du token</span>
            <input type="text" placeholder="0x…" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} />
          </label>
        </div>

        <label className="field">
          <span className="field__label">Fichier de scénarios (JSON)</span>
          <input type="file" accept="application/json" onChange={loadFile} />
        </label>

        <label className="field">
          <span className="field__label">Cas (JSON, modifiable directement)</span>
          <textarea
            className="textarea"
            rows={14}
            value={casesText}
            onChange={(e) => setCasesText(e.target.value)}
            spellCheck={false}
          />
        </label>

        <button type="submit" className="button" disabled={loading}>
          {loading ? "Rejeu…" : "Rejouer les scénarios"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <h2>
            {result.summary.passed}/{result.summary.total} conformes aux attentes
          </h2>
          <table className="table">
            <thead>
              <tr>
                <th>Cas</th>
                <th>Attendu</th>
                <th>Obtenu</th>
                <th>Résultat</th>
                <th>Bloqueurs</th>
              </tr>
            </thead>
            <tbody>
              {result.results.map((r) => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  <td>{r.expected ? "allow" : "deny"}</td>
                  <td>{r.allowed ? "allow" : "deny"}</td>
                  <td>
                    <Badge tone={r.pass ? "ok" : "ko"}>{r.pass ? "PASS" : "FAIL"}</Badge>
                  </td>
                  <td>{r.blockers.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
