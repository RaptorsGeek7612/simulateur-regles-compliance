import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FindingsList } from "./FindingsList";
import type { Finding } from "../types/onchain";

const findings: Finding[] = [
  { stage: "verdict", label: "compliance.canTransfer", ok: true },
  { stage: "token", label: "token non en pause", ok: true },
  { stage: "module", label: "CountryAllowModule", ok: false, detail: "0xabc" },
  { stage: "solde", label: "solde suffisant", ok: false, detail: "0.0 SIMT disponible" },
];

describe("FindingsList", () => {
  it("groups findings under their stage heading, in stage order rather than input order", () => {
    render(<FindingsList findings={findings} />);

    const headings = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    // STAGE_ORDER is token, solde, gel, identité, module, verdict — "token" must
    // come before "solde" even though solde appears first in the input array.
    expect(headings).toEqual(["État du token", "Solde", "Modules de compliance", "Verdict"]);
  });

  it("renders an OK badge for passing findings and a KO badge for failing ones", () => {
    render(<FindingsList findings={findings} />);
    expect(screen.getAllByText("OK")).toHaveLength(2);
    expect(screen.getAllByText("KO")).toHaveLength(2);
  });

  it("shows the detail line only when present", () => {
    render(<FindingsList findings={findings} />);
    expect(screen.getByText("0xabc")).toBeInTheDocument();
    expect(screen.getByText("0.0 SIMT disponible")).toBeInTheDocument();
    const tokenItem = screen.getByText("token non en pause").closest(".findings__item");
    expect(tokenItem?.querySelector(".findings__item-detail")).not.toBeInTheDocument();
  });

  it("calls renderExtra once per finding, passing that finding", () => {
    const renderExtra = vi.fn().mockReturnValue(null);
    render(<FindingsList findings={findings} renderExtra={renderExtra} />);
    expect(renderExtra).toHaveBeenCalledTimes(findings.length);
    expect(renderExtra).toHaveBeenCalledWith(findings[2]);
  });

  it("renders nothing for a stage with no findings", () => {
    render(<FindingsList findings={[{ stage: "identité", label: "émetteur vérifié", ok: true }]} />);
    expect(screen.queryByText("État du token")).not.toBeInTheDocument();
    expect(screen.getByText("Identité (ONCHAINID)")).toBeInTheDocument();
  });
});
