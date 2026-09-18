import type { QuestionnaireAnswers } from "./questionnaire.js";
import type { Rule, RuleResult } from "./types.js";
import { evaluateCondition } from "./condition.js";
import { classificationRules } from "../rules/classification.rules.js";
import { issuerObligationsRules } from "../rules/issuerObligations.rules.js";
import { caspAuthorizationRules } from "../rules/caspAuthorization.rules.js";
import { marketAbuseRules } from "../rules/marketAbuse.rules.js";

export interface DerivedClassification {
  isEMT: boolean;
  isART: boolean;
  isUtilityExempt: boolean;
  isOtherCryptoAsset: boolean;
}

/**
 * Calcule une seule fois les flags de classification (EMT / ART / jeton
 * utilitaire exempté / autre crypto-actif) à partir des réponses brutes.
 * Toutes les règles (classification, mais aussi obligations d'émetteur)
 * lisent ces flags via `derived.*` plutôt que de redériver les mêmes
 * conditions — évite la désynchronisation entre fichiers de règles.
 */
export function deriveClassification(answers: QuestionnaireAnswers): DerivedClassification {
  const { token } = answers;
  const excluded = token.isFinancialInstrument || token.isNFTUnique;

  const isEMT = !excluded && token.referencesSingleFiatCurrency;
  const isART = !excluded && !isEMT && token.referencesMultipleAssetsOrBasket;
  const isUtilityExempt =
    !excluded && !isEMT && !isART && token.isUtilityToken && token.utilityUsableOnlyOnIssuerPlatform;
  const isOtherCryptoAsset = !excluded && !isEMT && !isART && !isUtilityExempt;

  return { isEMT, isART, isUtilityExempt, isOtherCryptoAsset };
}

export const ALL_RULES: Rule[] = [
  ...classificationRules,
  ...issuerObligationsRules,
  ...caspAuthorizationRules,
  ...marketAbuseRules,
];

/**
 * Évalue toutes les règles MiCA contre un jeu de réponses au questionnaire.
 * Ne s'arrête pas à la première règle qui matche : plusieurs règles d'une
 * même zone peuvent s'appliquer en parallèle (ex. obligations générales +
 * livre blanc + réserve d'actifs pour un même émetteur d'ART).
 */
export function evaluateQuestionnaire(answers: QuestionnaireAnswers): RuleResult[] {
  const derived = deriveClassification(answers);
  const context = { ...answers, derived };

  return ALL_RULES.filter((rule) => evaluateCondition(rule.when, context)).map((rule) => ({
    ruleId: rule.id,
    area: rule.area,
    title: rule.title,
    articleRef: rule.articleRef,
    verdict: rule.result.verdict,
    label: rule.result.label,
    obligations: rule.result.obligations,
    explanation: rule.result.explanation,
  }));
}
