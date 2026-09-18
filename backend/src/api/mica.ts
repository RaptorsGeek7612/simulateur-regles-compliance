import { Router } from "express";
import { z } from "zod";
import { evaluateQuestionnaire } from "../engine/evaluate.js";
import { EMPTY_QUESTIONNAIRE } from "../engine/questionnaire.js";
import { MODULE_OBLIGATION_MAP } from "../shared/moduleObligationMap.js";

const questionnaireSchema = z.object({
  role: z.object({
    isIssuer: z.boolean(),
    isCASP: z.boolean(),
  }),
  token: z.object({
    isFinancialInstrument: z.boolean(),
    isNFTUnique: z.boolean(),
    referencesSingleFiatCurrency: z.boolean(),
    referencesMultipleAssetsOrBasket: z.boolean(),
    grantsClaimOnIssuer: z.boolean(),
    isUtilityToken: z.boolean(),
    utilityUsableOnlyOnIssuerPlatform: z.boolean(),
    isOfferedToPublic: z.boolean(),
    isAdmittedToTradingPlatform: z.boolean(),
    offerValueEUR12m: z.number().min(0),
    issuerIsCreditInstitution: z.boolean(),
    issuerIsEMoneyInstitution: z.boolean(),
    averageOutstandingValueEUR: z.number().min(0),
    numberOfHolders: z.number().min(0),
    numberOfTransactionsPerDay: z.number().min(0),
    isFreeOfCharge: z.boolean(),
  }),
  casp: z.object({
    providesCustody: z.boolean(),
    providesExchangeForFunds: z.boolean(),
    providesExchangeForOtherCrypto: z.boolean(),
    providesExecutionOfOrders: z.boolean(),
    providesPlacing: z.boolean(),
    providesReceptionAndTransmission: z.boolean(),
    providesAdvice: z.boolean(),
    providesPortfolioManagement: z.boolean(),
    providesTransferService: z.boolean(),
    operatesTradingPlatform: z.boolean(),
    isAlreadyAuthorisedEntity: z.boolean(),
  }),
  marketAbuse: z.object({
    tokenAdmittedToTradingPlatform: z.boolean(),
  }),
});

export const micaRouter = Router();

micaRouter.get("/questionnaire-template", (_req, res) => {
  res.json(EMPTY_QUESTIONNAIRE);
});

micaRouter.get("/module-map", (_req, res) => {
  res.json(MODULE_OBLIGATION_MAP);
});

micaRouter.post("/evaluate", (req, res) => {
  const parsed = questionnaireSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const results = evaluateQuestionnaire(parsed.data);
  res.json({ results });
});
