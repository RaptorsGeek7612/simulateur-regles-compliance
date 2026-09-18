import { describe, expect, it } from "vitest";
import { findLinksForModule, findLinksForRule, MODULE_OBLIGATION_MAP } from "../shared/moduleObligationMap.js";

describe("MODULE_OBLIGATION_MAP", () => {
  it("has no duplicate module names", () => {
    const names = MODULE_OBLIGATION_MAP.map((l) => l.moduleName);
    expect(new Set(names).size).toBe(names.length);
  });

  it("gives every link at least one rule id and a non-empty note", () => {
    for (const link of MODULE_OBLIGATION_MAP) {
      expect(link.ruleIds.length).toBeGreaterThan(0);
      expect(link.note.length).toBeGreaterThan(0);
    }
  });
});

describe("findLinksForModule", () => {
  it("finds the link for a known module", () => {
    const link = findLinksForModule("ClaimRequiredModule");
    expect(link?.ruleIds).toContain("casp-general-conduct");
  });

  it("returns undefined for an unknown module", () => {
    expect(findLinksForModule("SomeUnknownModule")).toBeUndefined();
  });
});

describe("findLinksForRule", () => {
  it("finds every module that translates a given rule", () => {
    const links = findLinksForRule("issuer-authorization-art-exempt");
    const names = links.map((l) => l.moduleName);
    expect(names).toEqual(expect.arrayContaining(["MaxHolderCountModule", "MinimumTicketModule"]));
  });

  it("returns an empty array for a rule with no on-chain translation", () => {
    expect(findLinksForRule("classification-emt")).toEqual([]);
  });
});
