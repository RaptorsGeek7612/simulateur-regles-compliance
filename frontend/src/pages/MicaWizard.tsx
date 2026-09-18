import { useEffect, useState } from "react";
import { evaluateQuestionnaire, getModuleMap, getQuestionnaireTemplate } from "../api/mica";
import { ApiError } from "../api/client";
import { DEFAULT_QUESTIONNAIRE, type ModuleObligationLink, type QuestionnaireAnswers, type RuleResult } from "../types/mica";
import { RoleStep } from "../wizard/RoleStep";
import { TokenStep } from "../wizard/TokenStep";
import { CaspStep } from "../wizard/CaspStep";
import { MarketAbuseStep } from "../wizard/MarketAbuseStep";
import { ResultsStep } from "../wizard/ResultsStep";

const STEPS = ["Rôle", "Token", "Services CASP", "Abus de marché", "Résultat"] as const;

export function MicaWizard() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(DEFAULT_QUESTIONNAIRE);
  const [moduleMap, setModuleMap] = useState<ModuleObligationLink[]>([]);
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<RuleResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getQuestionnaireTemplate()
      .then(setAnswers)
      .catch(() => {
        /* on garde les valeurs par défaut si l'API n'est pas joignable */
      });
    getModuleMap()
      .then(setModuleMap)
      .catch(() => {
        /* pas bloquant : simplement pas de liens croisés affichés */
      });
  }, []);

  async function goToResults() {
    setLoading(true);
    setError(null);
    try {
      const { results } = await evaluateQuestionnaire(answers);
      setResults(results);
      setStep(4);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setResults(null);
    setStep(0);
  }

  return (
    <div className="wizard">
      <ol className="wizard__steps">
        {STEPS.map((label, i) => (
          <li key={label} className={i === step ? "wizard__step wizard__step--active" : "wizard__step"}>
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && <RoleStep value={answers.role} onChange={(role) => setAnswers({ ...answers, role })} />}
      {step === 1 && <TokenStep value={answers.token} onChange={(token) => setAnswers({ ...answers, token })} />}
      {step === 2 && <CaspStep value={answers.casp} onChange={(casp) => setAnswers({ ...answers, casp })} />}
      {step === 3 && (
        <MarketAbuseStep
          value={answers.marketAbuse}
          onChange={(marketAbuse) => setAnswers({ ...answers, marketAbuse })}
        />
      )}
      {step === 4 && results && <ResultsStep results={results} moduleMap={moduleMap} />}

      {error && <p className="error">{error}</p>}

      <div className="wizard__nav">
        {step > 0 && step < 4 && (
          <button type="button" className="button button--secondary" onClick={() => setStep(step - 1)}>
            Précédent
          </button>
        )}
        {step < 3 && (
          <button type="button" className="button" onClick={() => setStep(step + 1)}>
            Suivant
          </button>
        )}
        {step === 3 && (
          <button type="button" className="button" onClick={goToResults} disabled={loading}>
            {loading ? "Évaluation…" : "Évaluer"}
          </button>
        )}
        {step === 4 && (
          <button type="button" className="button button--secondary" onClick={restart}>
            Recommencer
          </button>
        )}
      </div>
    </div>
  );
}
