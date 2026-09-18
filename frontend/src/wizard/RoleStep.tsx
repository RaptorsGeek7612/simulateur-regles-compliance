import type { QuestionnaireAnswers } from "../types/mica";
import { BooleanField } from "./WizardField";

export function RoleStep({
  value,
  onChange,
}: {
  value: QuestionnaireAnswers["role"];
  onChange: (value: QuestionnaireAnswers["role"]) => void;
}) {
  return (
    <div className="wizard-step">
      <h2>Votre rôle</h2>
      <p className="wizard-step__intro">
        Ces réponses déterminent quelles familles de règles MiCA sont pertinentes pour vous (obligations d'émetteur,
        agrément de prestataire de services sur crypto-actifs, ou les deux).
      </p>
      <div className="field-grid">
        <BooleanField
          meta={{ label: "Vous émettez ou offrez au public un crypto-actif" }}
          value={value.isIssuer}
          onChange={(v) => onChange({ ...value, isIssuer: v })}
        />
        <BooleanField
          meta={{
            label: "Vous fournissez des services sur crypto-actifs (CASP)",
            help: "Custody, échange, exécution d'ordres, conseil, gestion de portefeuille, plateforme de négociation…",
          }}
          value={value.isCASP}
          onChange={(v) => onChange({ ...value, isCASP: v })}
        />
      </div>
    </div>
  );
}
