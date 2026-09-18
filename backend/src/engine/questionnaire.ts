/**
 * Réponses au questionnaire MiCA. C'est le "scenario" évalué par evaluateCondition()
 * contre les règles de backend/src/rules/*.rules.ts — mêmes notations pointées
 * ("token.isUtilityToken") que celles attendues par Condition.field.
 */
export interface QuestionnaireAnswers {
  role: {
    isIssuer: boolean;
    isCASP: boolean;
  };
  token: {
    /** Instrument financier au sens MiFID II : hors périmètre MiCA (art. 2§4). */
    isFinancialInstrument: boolean;
    /** Unique et non fongible (NFT au sens strict) : en principe hors périmètre (considérant 11). */
    isNFTUnique: boolean;
    /** Référence une seule monnaie fiat officielle → candidat jeton de monnaie électronique (EMT). */
    referencesSingleFiatCurrency: boolean;
    /** Référence plusieurs actifs/un panier/une matière première → candidat jeton se référant à un actif (ART). */
    referencesMultipleAssetsOrBasket: boolean;
    /** Confère une créance sur l'émetteur (mécanisme de stabilisation). */
    grantsClaimOnIssuer: boolean;
    /** Donne accès à un bien/service (jeton utilitaire). */
    isUtilityToken: boolean;
    /** Utilisable uniquement sur la plateforme/l'écosystème de l'émetteur. */
    utilityUsableOnlyOnIssuerPlatform: boolean;
    isOfferedToPublic: boolean;
    isAdmittedToTradingPlatform: boolean;
    /** Valeur cumulée de l'offre sur 12 mois glissants, en euros. */
    offerValueEUR12m: number;
    issuerIsCreditInstitution: boolean;
    issuerIsEMoneyInstitution: boolean;
    /** Valeur moyenne en circulation, en euros — sert aux seuils "significatif". */
    averageOutstandingValueEUR: number;
    numberOfHolders: number;
    numberOfTransactionsPerDay: number;
    /** Offert gratuitement, sans contrepartie liée au prix d'un autre crypto-actif. */
    isFreeOfCharge: boolean;
  };
  casp: {
    providesCustody: boolean;
    providesExchangeForFunds: boolean;
    providesExchangeForOtherCrypto: boolean;
    providesExecutionOfOrders: boolean;
    providesPlacing: boolean;
    providesReceptionAndTransmission: boolean;
    providesAdvice: boolean;
    providesPortfolioManagement: boolean;
    providesTransferService: boolean;
    operatesTradingPlatform: boolean;
    /** Établissement de crédit / de monnaie électronique / entreprise d'investissement déjà agréé (art. 60-61). */
    isAlreadyAuthorisedEntity: boolean;
  };
  marketAbuse: {
    /** Le titre VI ne s'applique qu'aux crypto-actifs admis à la négociation sur une plateforme. */
    tokenAdmittedToTradingPlatform: boolean;
  };
}

export const EMPTY_QUESTIONNAIRE: QuestionnaireAnswers = {
  role: { isIssuer: false, isCASP: false },
  token: {
    isFinancialInstrument: false,
    isNFTUnique: false,
    referencesSingleFiatCurrency: false,
    referencesMultipleAssetsOrBasket: false,
    grantsClaimOnIssuer: false,
    isUtilityToken: false,
    utilityUsableOnlyOnIssuerPlatform: false,
    isOfferedToPublic: false,
    isAdmittedToTradingPlatform: false,
    offerValueEUR12m: 0,
    issuerIsCreditInstitution: false,
    issuerIsEMoneyInstitution: false,
    averageOutstandingValueEUR: 0,
    numberOfHolders: 0,
    numberOfTransactionsPerDay: 0,
    isFreeOfCharge: false,
  },
  casp: {
    providesCustody: false,
    providesExchangeForFunds: false,
    providesExchangeForOtherCrypto: false,
    providesExecutionOfOrders: false,
    providesPlacing: false,
    providesReceptionAndTransmission: false,
    providesAdvice: false,
    providesPortfolioManagement: false,
    providesTransferService: false,
    operatesTradingPlatform: false,
    isAlreadyAuthorisedEntity: false,
  },
  marketAbuse: { tokenAdmittedToTradingPlatform: false },
};
