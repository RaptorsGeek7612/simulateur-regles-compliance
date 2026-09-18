export type Area = "classification" | "issuer_obligations" | "casp_authorization" | "market_abuse";
export type Verdict = "applicable" | "not_applicable" | "warning";

export interface RuleResult {
  ruleId: string;
  area: Area;
  title: string;
  articleRef: string;
  verdict: Verdict;
  label: string;
  obligations: string[];
  explanation: string;
}

export interface QuestionnaireAnswers {
  role: {
    isIssuer: boolean;
    isCASP: boolean;
  };
  token: {
    isFinancialInstrument: boolean;
    isNFTUnique: boolean;
    referencesSingleFiatCurrency: boolean;
    referencesMultipleAssetsOrBasket: boolean;
    grantsClaimOnIssuer: boolean;
    isUtilityToken: boolean;
    utilityUsableOnlyOnIssuerPlatform: boolean;
    isOfferedToPublic: boolean;
    isAdmittedToTradingPlatform: boolean;
    offerValueEUR12m: number;
    issuerIsCreditInstitution: boolean;
    issuerIsEMoneyInstitution: boolean;
    averageOutstandingValueEUR: number;
    numberOfHolders: number;
    numberOfTransactionsPerDay: number;
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
    isAlreadyAuthorisedEntity: boolean;
  };
  marketAbuse: {
    tokenAdmittedToTradingPlatform: boolean;
  };
}

export interface ModuleObligationLink {
  moduleName: string;
  ruleIds: string[];
  note: string;
}

export const AREA_LABELS: Record<Area, string> = {
  classification: "Classification du crypto-actif",
  issuer_obligations: "Obligations d'émetteur",
  casp_authorization: "Agrément CASP",
  market_abuse: "Abus de marché",
};

export const VERDICT_LABELS: Record<Verdict, string> = {
  applicable: "Applicable",
  not_applicable: "Non applicable",
  warning: "Attention",
};

/** Valeurs par défaut, utilisées le temps que /api/mica/questionnaire-template réponde. */
export const DEFAULT_QUESTIONNAIRE: QuestionnaireAnswers = {
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
