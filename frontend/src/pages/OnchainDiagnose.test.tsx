import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnchainDiagnose } from "./OnchainDiagnose";
import type { DiagnoseResult } from "../types/onchain";

const { mockDiagnose, mockGetOnchainConfig, mockGetModuleMap } = vi.hoisted(() => ({
  mockDiagnose: vi.fn(),
  mockGetOnchainConfig: vi.fn(),
  mockGetModuleMap: vi.fn(),
}));

vi.mock("../api/onchain", () => ({
  diagnose: mockDiagnose,
  getOnchainConfig: mockGetOnchainConfig,
}));

vi.mock("../api/mica", () => ({
  getModuleMap: mockGetModuleMap,
}));

const FROM = "0x1111111111111111111111111111111111111111";
const TO = "0x2222222222222222222222222222222222222222";

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("De (adresse)"), FROM);
  await user.type(screen.getByLabelText("Vers (adresse)"), TO);
  await user.type(screen.getByLabelText("Montant (unités de base)"), "1000000000000000000");
  await user.click(screen.getByRole("button", { name: "Diagnostiquer" }));
}

describe("OnchainDiagnose", () => {
  beforeEach(() => {
    mockGetOnchainConfig.mockResolvedValue({ hasDefaultRpc: false, defaultTokenAddress: null });
    mockGetModuleMap.mockResolvedValue([]);
  });

  it("renders an allowed verdict with every finding", async () => {
    const result: DiagnoseResult = {
      allowed: true,
      findings: [
        { stage: "token", label: "token non en pause", ok: true },
        { stage: "verdict", label: "compliance.canTransfer", ok: true },
      ],
    };
    mockDiagnose.mockResolvedValue(result);
    const user = userEvent.setup();
    render(<OnchainDiagnose />);

    await fillAndSubmit(user);

    expect(await screen.findByText("Transfert autorisé")).toBeInTheDocument();
    expect(mockDiagnose).toHaveBeenCalledWith({
      rpcUrl: undefined,
      tokenAddress: undefined,
      from: FROM,
      to: TO,
      amount: "1000000000000000000",
    });
  });

  it("renders a denied verdict and surfaces the linked MiCA obligation for a failing module", async () => {
    mockGetModuleMap.mockResolvedValue([
      { moduleName: "CountryAllowModule", ruleIds: ["market-abuse-scope"], note: "Bloque les pays non autorisés." },
    ]);
    const result: DiagnoseResult = {
      allowed: false,
      findings: [
        { stage: "module", label: "CountryAllowModule", ok: false, detail: "0xabc" },
        { stage: "verdict", label: "compliance.canTransfer", ok: false },
      ],
    };
    mockDiagnose.mockResolvedValue(result);
    const user = userEvent.setup();
    render(<OnchainDiagnose />);

    await fillAndSubmit(user);

    expect(await screen.findByText("Transfert refusé")).toBeInTheDocument();
    expect(screen.getByText(/Bloque les pays non autorisés\./)).toBeInTheDocument();
  });

  it("shows the API error message when the on-chain read fails", async () => {
    const { ApiError } = await import("../api/client");
    mockDiagnose.mockRejectedValue(new ApiError("Lecture on-chain impossible : timeout", 502));
    const user = userEvent.setup();
    render(<OnchainDiagnose />);

    await fillAndSubmit(user);

    expect(await screen.findByText("Lecture on-chain impossible : timeout")).toBeInTheDocument();
  });

  it("uses the server-configured RPC/token placeholders once /config resolves", async () => {
    mockGetOnchainConfig.mockResolvedValue({ hasDefaultRpc: true, defaultTokenAddress: "0x9999999999999999999999999999999999999" });
    render(<OnchainDiagnose />);

    expect(await screen.findByPlaceholderText("(par défaut côté serveur)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0x9999999999999999999999999999999999999")).toBeInTheDocument();
  });
});
