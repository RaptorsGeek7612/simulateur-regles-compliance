import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModuleLinksForRule, RuleLinksForModule } from "./ObligationLinks";
import type { ModuleObligationLink } from "../types/mica";

const moduleMap: ModuleObligationLink[] = [
  {
    moduleName: "MaxHolderCountModule",
    ruleIds: ["issuer-authorization-art-exempt", "issuer-authorization-art"],
    note: "Plafonne le nombre de porteurs on-chain.",
  },
  {
    moduleName: "ClaimRequiredModule",
    ruleIds: ["casp-general-conduct"],
    note: "Exige une créance ONCHAINID valide avant transfert.",
  },
];

describe("ModuleLinksForRule", () => {
  it("renders every module linked to the given rule", () => {
    render(<ModuleLinksForRule ruleId="issuer-authorization-art" moduleMap={moduleMap} />);
    expect(screen.getByText("MaxHolderCountModule")).toBeInTheDocument();
    expect(screen.getByText("Plafonne le nombre de porteurs on-chain.")).toBeInTheDocument();
    expect(screen.queryByText("ClaimRequiredModule")).not.toBeInTheDocument();
  });

  it("renders nothing when no module translates the rule", () => {
    const { container } = render(<ModuleLinksForRule ruleId="classification-emt" moduleMap={moduleMap} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("RuleLinksForModule", () => {
  it("renders the note for a known module", () => {
    render(<RuleLinksForModule moduleName="ClaimRequiredModule" moduleMap={moduleMap} />);
    expect(screen.getByText(/Exige une créance ONCHAINID valide avant transfert\./)).toBeInTheDocument();
  });

  it("renders nothing for an unknown module", () => {
    const { container } = render(<RuleLinksForModule moduleName="SomeUnknownModule" moduleMap={moduleMap} />);
    expect(container).toBeEmptyDOMElement();
  });
});
