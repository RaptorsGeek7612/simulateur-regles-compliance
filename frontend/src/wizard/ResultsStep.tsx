import type { ModuleObligationLink, RuleResult } from "../types/mica";
import { AREA_LABELS, VERDICT_LABELS } from "../types/mica";
import { Badge, type Tone } from "../components/Badge";
import { ModuleLinksForRule } from "../components/ObligationLinks";

const VERDICT_TONE: Record<RuleResult["verdict"], Tone> = {
  applicable: "ok",
  warning: "warning",
  not_applicable: "neutral",
};

const AREA_ORDER: RuleResult["area"][] = ["classification", "issuer_obligations", "casp_authorization", "market_abuse"];

export function ResultsStep({ results, moduleMap }: { results: RuleResult[]; moduleMap: ModuleObligationLink[] }) {
  const byArea = new Map<RuleResult["area"], RuleResult[]>();
  for (const r of results) {
    const list = byArea.get(r.area) ?? [];
    list.push(r);
    byArea.set(r.area, list);
  }

  const applicableCount = results.filter((r) => r.verdict !== "not_applicable").length;

  if (results.length === 0) {
    return (
      <div className="wizard-step">
        <h2>Résultat</h2>
        <p>Aucune règle ne matche ces réponses.</p>
      </div>
    );
  }

  return (
    <div className="wizard-step">
      <h2>Résultat</h2>
      <p className="wizard-step__intro">
        {applicableCount} règle{applicableCount > 1 ? "s" : ""} applicable{applicableCount > 1 ? "s" : ""} ou à
        surveiller, sur {results.length} évaluée{results.length > 1 ? "s" : ""}.
      </p>
      {AREA_ORDER.filter((area) => byArea.has(area)).map((area) => (
        <section key={area} className="results-area">
          <h3>{AREA_LABELS[area]}</h3>
          <div className="rule-results">
            {byArea.get(area)!.map((r) => (
              <article key={r.ruleId} className={`rule-result rule-result--${r.verdict}`}>
                <div className="rule-result__header">
                  <Badge tone={VERDICT_TONE[r.verdict]}>{VERDICT_LABELS[r.verdict]}</Badge>
                  <h4>{r.title}</h4>
                  <span className="rule-result__article">{r.articleRef}</span>
                </div>
                <p className="rule-result__label">{r.label}</p>
                <p className="rule-result__explanation">{r.explanation}</p>
                {r.obligations.length > 0 && (
                  <ul className="rule-result__obligations">
                    {r.obligations.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                )}
                <ModuleLinksForRule ruleId={r.ruleId} moduleMap={moduleMap} />
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
