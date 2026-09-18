import type { QuestionnaireAnswers } from "../types/mica";
import { BooleanField } from "./WizardField";

export function MarketAbuseStep({
  value,
  onChange,
}: {
  value: QuestionnaireAnswers["marketAbuse"];
  onChange: (value: QuestionnaireAnswers["marketAbuse"]) => void;
}) {
  return (
    <div className="wizard-step">
      <h2>Abus de marché</h2>
      <p className="wizard-step__intro">
        Le Titre VI (abus de marché) ne s'applique qu'aux crypto-actifs admis à la négociation sur une plateforme.
      </p>
      <div className="field-grid">
        <BooleanField
          meta={{ label: "Le token est admis à la négociation sur une plateforme" }}
          value={value.tokenAdmittedToTradingPlatform}
          onChange={(v) => onChange({ ...value, tokenAdmittedToTradingPlatform: v })}
        />
      </div>
    </div>
  );
}
