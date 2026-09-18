import { describe, expect, it } from "vitest";
import { deriveClassification, evaluateQuestionnaire } from "../engine/evaluate.js";
import { EMPTY_QUESTIONNAIRE, type QuestionnaireAnswers } from "../engine/questionnaire.js";

function withAnswers(overrides: {
  role?: Partial<QuestionnaireAnswers["role"]>;
  token?: Partial<QuestionnaireAnswers["token"]>;
  casp?: Partial<QuestionnaireAnswers["casp"]>;
  marketAbuse?: Partial<QuestionnaireAnswers["marketAbuse"]>;
}): QuestionnaireAnswers {
  const base = JSON.parse(JSON.stringify(EMPTY_QUESTIONNAIRE)) as QuestionnaireAnswers;
  return {
    role: { ...base.role, ...overrides.role },
    token: { ...base.token, ...overrides.token },
    casp: { ...base.casp, ...overrides.casp },
    marketAbuse: { ...base.marketAbuse, ...overrides.marketAbuse },
  };
}

function ruleIds(answers: QuestionnaireAnswers): string[] {
  return evaluateQuestionnaire(answers).map((r) => r.ruleId);
}

describe("deriveClassification", () => {
  it("excludes financial instruments even if they also reference a fiat currency", () => {
    const d = deriveClassification(
      withAnswers({ token: { isFinancialInstrument: true, referencesSingleFiatCurrency: true } })
    );
    expect(d).toEqual({ isEMT: false, isART: false, isUtilityExempt: false, isOtherCryptoAsset: false });
  });

  it("excludes unique NFTs", () => {
    const d = deriveClassification(withAnswers({ token: { isNFTUnique: true } }));
    expect(d).toEqual({ isEMT: false, isART: false, isUtilityExempt: false, isOtherCryptoAsset: false });
  });

  it("classifies as EMT when referencing a single fiat currency", () => {
    const d = deriveClassification(withAnswers({ token: { referencesSingleFiatCurrency: true } }));
    expect(d).toEqual({ isEMT: true, isART: false, isUtilityExempt: false, isOtherCryptoAsset: false });
  });

  it("classifies as ART when referencing multiple assets, and EMT takes priority over ART", () => {
    const art = deriveClassification(withAnswers({ token: { referencesMultipleAssetsOrBasket: true } }));
    expect(art).toEqual({ isEMT: false, isART: true, isUtilityExempt: false, isOtherCryptoAsset: false });

    const both = deriveClassification(
      withAnswers({ token: { referencesSingleFiatCurrency: true, referencesMultipleAssetsOrBasket: true } })
    );
    expect(both.isEMT).toBe(true);
    expect(both.isART).toBe(false);
  });

  it("classifies as utility-exempt only when restricted to the issuer's own platform", () => {
    const exempt = deriveClassification(
      withAnswers({ token: { isUtilityToken: true, utilityUsableOnlyOnIssuerPlatform: true } })
    );
    expect(exempt.isUtilityExempt).toBe(true);
    expect(exempt.isOtherCryptoAsset).toBe(false);

    const notExempt = deriveClassification(withAnswers({ token: { isUtilityToken: true } }));
    expect(notExempt.isUtilityExempt).toBe(false);
    expect(notExempt.isOtherCryptoAsset).toBe(true);
  });

  it("falls back to 'other crypto asset' when nothing else matches", () => {
    const d = deriveClassification(withAnswers({}));
    expect(d).toEqual({ isEMT: false, isART: false, isUtilityExempt: false, isOtherCryptoAsset: true });
  });
});

describe("evaluateQuestionnaire — classification", () => {
  it("returns only the exclusion rule for a MiFID II financial instrument", () => {
    const ids = ruleIds(withAnswers({ token: { isFinancialInstrument: true } }));
    expect(ids).toContain("classification-excluded-financial-instrument");
    expect(ids).not.toContain("classification-other-crypto-asset");
  });

  it("returns the EMT rule for a single-fiat-referencing token", () => {
    const ids = ruleIds(withAnswers({ token: { referencesSingleFiatCurrency: true } }));
    expect(ids).toContain("classification-emt");
  });
});

describe("evaluateQuestionnaire — issuer obligations", () => {
  it("requires a white paper above the 1M€ small-offer threshold", () => {
    const answers = withAnswers({
      role: { isIssuer: true },
      token: { isOfferedToPublic: true, isFreeOfCharge: false, offerValueEUR12m: 1_500_000 },
    });
    const ids = ruleIds(answers);
    expect(ids).toContain("issuer-white-paper-other-crypto-asset");
    expect(ids).not.toContain("issuer-small-offer-exemption");
  });

  it("exempts a white paper below the 1M€ threshold", () => {
    const answers = withAnswers({
      role: { isIssuer: true },
      token: { isOfferedToPublic: true, offerValueEUR12m: 500_000 },
    });
    const ids = ruleIds(answers);
    expect(ids).toContain("issuer-small-offer-exemption");
    expect(ids).not.toContain("issuer-white-paper-other-crypto-asset");
  });

  it("exempts a free-of-charge offer regardless of value", () => {
    const answers = withAnswers({
      role: { isIssuer: true },
      token: { isOfferedToPublic: true, isFreeOfCharge: true, offerValueEUR12m: 10_000_000 },
    });
    expect(ruleIds(answers)).toContain("issuer-free-of-charge-exemption");
  });

  it("requires ART authorization above the 5M€ threshold, and flags a possible exemption below it", () => {
    const above = withAnswers({
      role: { isIssuer: true },
      token: { referencesMultipleAssetsOrBasket: true, offerValueEUR12m: 6_000_000 },
    });
    expect(ruleIds(above)).toContain("issuer-authorization-art");

    const below = withAnswers({
      role: { isIssuer: true },
      token: { referencesMultipleAssetsOrBasket: true, offerValueEUR12m: 1_000_000 },
    });
    const belowIds = ruleIds(below);
    expect(belowIds).toContain("issuer-authorization-art-exempt");
    expect(belowIds).not.toContain("issuer-authorization-art");
  });

  it("flags a missing EMT-eligible entity status, and clears it for a credit institution", () => {
    const missing = withAnswers({ role: { isIssuer: true }, token: { referencesSingleFiatCurrency: true } });
    expect(ruleIds(missing)).toContain("issuer-authorization-emt-entity-missing");

    const ok = withAnswers({
      role: { isIssuer: true },
      token: { referencesSingleFiatCurrency: true, issuerIsCreditInstitution: true },
    });
    const okIds = ruleIds(ok);
    expect(okIds).toContain("issuer-authorization-emt-entity-ok");
    expect(okIds).not.toContain("issuer-authorization-emt-entity-missing");
  });

  it("requires a reserve of assets for both EMT and ART issuers", () => {
    const emt = withAnswers({ role: { isIssuer: true }, token: { referencesSingleFiatCurrency: true } });
    expect(ruleIds(emt)).toContain("issuer-reserve-of-assets");

    const art = withAnswers({ role: { isIssuer: true }, token: { referencesMultipleAssetsOrBasket: true } });
    expect(ruleIds(art)).toContain("issuer-reserve-of-assets");
  });

  it("flags a 'significant token' once any simplified threshold is crossed", () => {
    const answers = withAnswers({
      role: { isIssuer: true },
      token: { referencesSingleFiatCurrency: true, numberOfHolders: 3_000_000 },
    });
    expect(ruleIds(answers)).toContain("issuer-significant-token");
  });

  it("does not apply any issuer obligation to a non-issuer", () => {
    const ids = ruleIds(withAnswers({ role: { isIssuer: false } }));
    expect(ids.filter((id) => id.startsWith("issuer-"))).toEqual([]);
  });
});

describe("evaluateQuestionnaire — CASP authorization", () => {
  it("requires full authorization unless already an authorised entity", () => {
    const needsAuth = withAnswers({ role: { isCASP: true } });
    expect(ruleIds(needsAuth)).toContain("casp-authorization-required");

    const notified = withAnswers({ role: { isCASP: true }, casp: { isAlreadyAuthorisedEntity: true } });
    const notifiedIds = ruleIds(notified);
    expect(notifiedIds).toContain("casp-simplified-notification");
    expect(notifiedIds).not.toContain("casp-authorization-required");
  });

  it("adds a service-specific rule per service actually provided", () => {
    const answers = withAnswers({ role: { isCASP: true }, casp: { providesCustody: true } });
    expect(ruleIds(answers)).toContain("casp-custody");
    expect(ruleIds(answers)).not.toContain("casp-exchange");
  });

  it("applies general CASP conduct duties to any CASP, independent of services", () => {
    expect(ruleIds(withAnswers({ role: { isCASP: true } }))).toContain("casp-general-conduct");
  });

  it("does not apply any CASP rule to a non-CASP", () => {
    const ids = ruleIds(withAnswers({ role: { isCASP: false } }));
    expect(ids.filter((id) => id.startsWith("casp-"))).toEqual([]);
  });
});

describe("evaluateQuestionnaire — market abuse", () => {
  it("is not applicable when the token isn't admitted to trading", () => {
    const ids = ruleIds(withAnswers({}));
    expect(ids).toContain("market-abuse-not-applicable");
    expect(ids).not.toContain("market-abuse-scope");
  });

  it("applies the full set of prohibitions once admitted to trading", () => {
    const ids = ruleIds(withAnswers({ marketAbuse: { tokenAdmittedToTradingPlatform: true } }));
    expect(ids).toEqual(
      expect.arrayContaining([
        "market-abuse-scope",
        "market-abuse-insider-dealing",
        "market-abuse-unlawful-disclosure",
        "market-abuse-manipulation",
      ])
    );
  });

  it("adds the issuer disclosure duty only when the issuer is also the caller", () => {
    const asIssuer = withAnswers({ role: { isIssuer: true }, marketAbuse: { tokenAdmittedToTradingPlatform: true } });
    expect(ruleIds(asIssuer)).toContain("market-abuse-issuer-disclosure");

    const notIssuer = withAnswers({ marketAbuse: { tokenAdmittedToTradingPlatform: true } });
    expect(ruleIds(notIssuer)).not.toContain("market-abuse-issuer-disclosure");
  });
});
