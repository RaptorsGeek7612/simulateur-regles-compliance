import { afterEach, describe, expect, it, vi } from "vitest";
import type { JsonRpcProvider } from "ethers";
import type { DiagnoseResult } from "../onchain/diagnose.js";

vi.mock("../onchain/diagnose.js", () => ({
  diagnose: vi.fn(),
}));

import { diagnose } from "../onchain/diagnose.js";
import { runScenarios, type ScenarioCase } from "../onchain/scenarioRunner.js";

const mockDiagnose = vi.mocked(diagnose);
const provider = {} as JsonRpcProvider;
const TOKEN_ADDR = "0xT0000000000000000000000000000000000000";

function result(allowed: boolean, blockers: string[] = []): DiagnoseResult {
  return {
    allowed,
    findings: [
      { stage: "verdict", label: "compliance.canTransfer", ok: allowed },
      ...blockers.map((label) => ({ stage: "module" as const, label, ok: false })),
    ],
  };
}

describe("runScenarios", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });


  it("passes a case whose actual result matches the expectation", async () => {
    mockDiagnose.mockResolvedValueOnce(result(true));
    const cases: ScenarioCase[] = [
      { name: "ok case", from: "0xF", to: "0xT", amount: "1", expect: "allow" },
    ];

    const { results, summary } = await runScenarios(provider, TOKEN_ADDR, cases);

    expect(results).toEqual([
      { name: "ok case", pass: true, allowed: true, expected: true, blockers: [] },
    ]);
    expect(summary).toEqual({ passed: 1, total: 1 });
  });

  it("fails a case whose actual result contradicts the expectation, and surfaces the blockers", async () => {
    mockDiagnose.mockResolvedValueOnce(result(false, ["MinimumTicketModule"]));
    const cases: ScenarioCase[] = [
      { name: "should have been allowed", from: "0xF", to: "0xT", amount: "1", expect: "allow" },
    ];

    const { results, summary } = await runScenarios(provider, TOKEN_ADDR, cases);

    expect(results[0]).toEqual({
      name: "should have been allowed",
      pass: false,
      allowed: false,
      expected: true,
      blockers: ["MinimumTicketModule"],
    });
    expect(summary).toEqual({ passed: 0, total: 1 });
  });

  it("runs every case and tallies the summary across a mixed batch", async () => {
    mockDiagnose
      .mockResolvedValueOnce(result(true))
      .mockResolvedValueOnce(result(false, ["ClaimRequiredModule"]))
      .mockResolvedValueOnce(result(true));
    const cases: ScenarioCase[] = [
      { name: "a", from: "0xF", to: "0xT", amount: "1", expect: "allow" },
      { name: "b", from: "0xF", to: "0xT", amount: "1", expect: "deny" },
      { name: "c", from: "0xF", to: "0xT", amount: "1", expect: "deny" },
    ];

    const { results, summary } = await runScenarios(provider, TOKEN_ADDR, cases);

    expect(results.map((r) => r.pass)).toEqual([true, true, false]);
    expect(summary).toEqual({ passed: 2, total: 3 });
    expect(mockDiagnose).toHaveBeenCalledTimes(3);
  });

  it("passes each case's from/to/amount through to diagnose()", async () => {
    mockDiagnose.mockResolvedValueOnce(result(true));
    const cases: ScenarioCase[] = [
      { name: "a", from: "0xFROM", to: "0xTO", amount: "12345", expect: "allow" },
    ];

    await runScenarios(provider, TOKEN_ADDR, cases);

    expect(mockDiagnose).toHaveBeenCalledWith(provider, TOKEN_ADDR, "0xFROM", "0xTO", 12345n);
  });
});
