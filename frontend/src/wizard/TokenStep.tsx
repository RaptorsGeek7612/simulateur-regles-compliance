import type { QuestionnaireAnswers } from "../types/mica";
import { tokenFieldMeta } from "./fieldMeta";
import { BooleanField, NumberField } from "./WizardField";

const BOOLEAN_FIELDS: (keyof QuestionnaireAnswers["token"])[] = [
  "isFinancialInstrument",
  "isNFTUnique",
  "referencesSingleFiatCurrency",
  "referencesMultipleAssetsOrBasket",
  "grantsClaimOnIssuer",
  "isUtilityToken",
  "utilityUsableOnlyOnIssuerPlatform",
  "isOfferedToPublic",
  "isAdmittedToTradingPlatform",
  "issuerIsCreditInstitution",
  "issuerIsEMoneyInstitution",
  "isFreeOfCharge",
];

const NUMBER_FIELDS: (keyof QuestionnaireAnswers["token"])[] = [
  "offerValueEUR12m",
  "averageOutstandingValueEUR",
  "numberOfHolders",
  "numberOfTransactionsPerDay",
];

export function TokenStep({
  value,
  onChange,
}: {
  value: QuestionnaireAnswers["token"];
  onChange: (value: QuestionnaireAnswers["token"]) => void;
}) {
  return (
    <div className="wizard-step">
      <h2>Le token</h2>
      <p className="wizard-step__intro">
        Nature, offre et taille du crypto-actif : ces réponses déterminent sa classification (EMT / ART / jeton
        utilitaire / autre) et les seuils d'obligations applicables.
      </p>
      <div className="field-grid">
        {BOOLEAN_FIELDS.map((key) => (
          <BooleanField
            key={key}
            meta={tokenFieldMeta[key]}
            value={value[key] as boolean}
            onChange={(v) => onChange({ ...value, [key]: v })}
          />
        ))}
      </div>
      <div className="field-grid field-grid--numbers">
        {NUMBER_FIELDS.map((key) => (
          <NumberField
            key={key}
            meta={tokenFieldMeta[key]}
            value={value[key] as number}
            onChange={(v) => onChange({ ...value, [key]: v })}
          />
        ))}
      </div>
    </div>
  );
}
