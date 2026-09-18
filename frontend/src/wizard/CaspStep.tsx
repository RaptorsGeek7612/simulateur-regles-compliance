import type { QuestionnaireAnswers } from "../types/mica";
import { caspFieldMeta } from "./fieldMeta";
import { BooleanField } from "./WizardField";

const FIELDS: (keyof QuestionnaireAnswers["casp"])[] = [
  "providesCustody",
  "providesExchangeForFunds",
  "providesExchangeForOtherCrypto",
  "providesExecutionOfOrders",
  "providesPlacing",
  "providesReceptionAndTransmission",
  "providesAdvice",
  "providesPortfolioManagement",
  "providesTransferService",
  "operatesTradingPlatform",
  "isAlreadyAuthorisedEntity",
];

export function CaspStep({
  value,
  onChange,
}: {
  value: QuestionnaireAnswers["casp"];
  onChange: (value: QuestionnaireAnswers["casp"]) => void;
}) {
  return (
    <div className="wizard-step">
      <h2>Services sur crypto-actifs</h2>
      <p className="wizard-step__intro">
        Cochez chaque service effectivement fourni. Sans objet si vous n'êtes pas prestataire de services sur
        crypto-actifs (CASP).
      </p>
      <div className="field-grid">
        {FIELDS.map((key) => (
          <BooleanField
            key={key}
            meta={caspFieldMeta[key]}
            value={value[key]}
            onChange={(v) => onChange({ ...value, [key]: v })}
          />
        ))}
      </div>
    </div>
  );
}
