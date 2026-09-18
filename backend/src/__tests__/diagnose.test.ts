import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JsonRpcProvider } from "ethers";
import type { Finding } from "../onchain/diagnose.js";

const TOKEN_ADDR = "0xT0000000000000000000000000000000000000";
const REGISTRY_ADDR = "0xR0000000000000000000000000000000000000";
const COMPLIANCE_ADDR = "0xC0000000000000000000000000000000000000";
const MODULE_ADDR = "0xM0000000000000000000000000000000000000";
const FROM = "0xF0000000000000000000000000000000000000";
const TO = "0x2000000000000000000000000000000000000000";
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

// vi.mock factories are hoisted above imports, so any state they close over
// must go through vi.hoisted() to avoid a temporal-dead-zone error.
const { contracts } = vi.hoisted(() => ({ contracts: new Map<string, Record<string, unknown>>() }));

vi.mock("ethers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ethers")>();
  return {
    ...actual,
    Contract: vi.fn().mockImplementation((address: string) => {
      const impl = contracts.get(address);
      if (!impl) throw new Error(`no mock contract registered for ${address}`);
      return impl;
    }),
  };
});

import { diagnose } from "../onchain/diagnose.js";

function defaultToken(overrides: Record<string, unknown> = {}) {
  return {
    decimals: async () => 18,
    symbol: async () => "TST",
    identityRegistry: async () => REGISTRY_ADDR,
    compliance: async () => COMPLIANCE_ADDR,
    paused: async () => false,
    balanceOf: async () => 1_000_000_000_000_000_000n,
    isFrozen: async () => false,
    getFrozenTokens: async () => 0n,
    ...overrides,
  };
}

function defaultRegistry(overrides: Record<string, unknown> = {}) {
  return {
    isVerified: async () => true,
    identity: async () => "0xAbCdEf0000000000000000000000000000000000",
    investorCountry: async () => 250,
    ...overrides,
  };
}

function defaultCompliance(overrides: Record<string, unknown> = {}) {
  return {
    getModules: async () => [MODULE_ADDR],
    canTransfer: async () => true,
    ...overrides,
  };
}

function defaultModule(overrides: Record<string, unknown> = {}) {
  return {
    name: async () => "MaxHolderCountModule",
    moduleCheck: async () => true,
    ...overrides,
  };
}

const provider = {} as JsonRpcProvider;
const amount = 500_000_000_000_000_000n;

beforeEach(() => {
  contracts.clear();
  contracts.set(TOKEN_ADDR, defaultToken());
  contracts.set(REGISTRY_ADDR, defaultRegistry());
  contracts.set(COMPLIANCE_ADDR, defaultCompliance());
  contracts.set(MODULE_ADDR, defaultModule());
});

function findingFor(findings: Finding[], label: string) {
  return findings.find((f) => f.label === label);
}

describe("diagnose", () => {
  it("allows a transfer when every stage passes", async () => {
    const result = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    expect(result.allowed).toBe(true);
    expect(result.findings.every((f) => f.ok)).toBe(true);
  });

  it("flags a paused token", async () => {
    contracts.set(TOKEN_ADDR, defaultToken({ paused: async () => true }));
    const { findings } = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    expect(findingFor(findings, "token non en pause")?.ok).toBe(false);
  });

  it("treats a token without paused() as passing that stage", async () => {
    const token = defaultToken();
    delete (token as Record<string, unknown>).paused;
    token.paused = async () => {
      throw new Error("not implemented");
    };
    contracts.set(TOKEN_ADDR, token);
    const { findings } = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    const f = findingFor(findings, "token non en pause");
    expect(f?.ok).toBe(true);
    expect(f?.detail).toBe("non exposé");
  });

  it("flags an insufficient balance", async () => {
    contracts.set(TOKEN_ADDR, defaultToken({ balanceOf: async () => 100n }));
    const { findings } = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    expect(findingFor(findings, "solde suffisant")?.ok).toBe(false);
  });

  // compliance.canTransfer() only checks bound modules — pause, freeze and
  // balance are separate require()s in the real Token.transfer(), so a
  // transfer can revert even when canTransfer() itself returns true.
  // Confirmed against the reference T-REX contract (see diagnose.ts).
  it("denies the overall transfer when the balance is insufficient, even if compliance.canTransfer() itself passes", async () => {
    contracts.set(TOKEN_ADDR, defaultToken({ balanceOf: async () => 100n }));
    contracts.set(COMPLIANCE_ADDR, defaultCompliance({ canTransfer: async () => true }));
    const result = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    expect(findingFor(result.findings, "compliance.canTransfer")?.ok).toBe(true);
    expect(result.allowed).toBe(false);
  });

  it("denies the overall transfer when the token is paused, even if compliance.canTransfer() itself passes", async () => {
    contracts.set(TOKEN_ADDR, defaultToken({ paused: async () => true }));
    contracts.set(COMPLIANCE_ADDR, defaultCompliance({ canTransfer: async () => true }));
    const result = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    expect(result.allowed).toBe(false);
  });

  it("allows the overall transfer only when every single finding passes", async () => {
    const result = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    expect(result.allowed).toBe(true);
    expect(result.findings.every((f) => f.ok)).toBe(true);
  });

  it("flags a frozen sender and recipient separately", async () => {
    contracts.set(TOKEN_ADDR, defaultToken({ isFrozen: async (addr: string) => addr === FROM }));
    const { findings } = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    expect(findingFor(findings, "émetteur non gelé")?.ok).toBe(false);
    expect(findingFor(findings, "destinataire non gelé")?.ok).toBe(true);
  });

  it("computes the free (non-frozen) balance against the requested amount", async () => {
    contracts.set(
      TOKEN_ADDR,
      defaultToken({ balanceOf: async () => 1_000n, getFrozenTokens: async () => 900n })
    );
    const { findings } = await diagnose(provider, TOKEN_ADDR, FROM, TO, 500n);
    const f = findingFor(findings, "part non gelée suffisante");
    expect(f?.ok).toBe(false);
    expect(f?.detail).toBe("0.0000000000000001 TST libre, 0.0000000000000009 TST gelé");
  });

  it("treats an unreadable freeze state as passing, with a detail note", async () => {
    contracts.set(
      TOKEN_ADDR,
      defaultToken({
        isFrozen: async () => {
          throw new Error("revert");
        },
      })
    );
    const { findings } = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    const f = findingFor(findings, "état de gel");
    expect(f?.ok).toBe(true);
    expect(f?.detail).toBe("illisible");
  });

  it("flags an unverified identity and reports a missing ONCHAINID", async () => {
    contracts.set(
      REGISTRY_ADDR,
      defaultRegistry({ isVerified: async () => false, identity: async () => ZERO_ADDR })
    );
    const { findings } = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    const f = findingFor(findings, "émetteur vérifié");
    expect(f?.ok).toBe(false);
    expect(f?.detail).toBe("aucune ONCHAINID enregistrée");
  });

  it("reports a read failure on identity lookup as a failing finding", async () => {
    contracts.set(
      REGISTRY_ADDR,
      defaultRegistry({
        isVerified: async () => {
          throw new Error("revert");
        },
      })
    );
    const { findings } = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    const f = findingFor(findings, "émetteur vérifié");
    expect(f?.ok).toBe(false);
    expect(f?.detail).toContain("lecture impossible");
  });

  it("names the failing module and reports it as a failing finding", async () => {
    contracts.set(MODULE_ADDR, defaultModule({ moduleCheck: async () => false }));
    const { findings } = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    const f = findingFor(findings, "MaxHolderCountModule");
    expect(f?.ok).toBe(false);
    expect(f?.detail).toBe(MODULE_ADDR);
  });

  it("falls back to the module address when name() reverts", async () => {
    contracts.set(
      MODULE_ADDR,
      defaultModule({
        name: async () => {
          throw new Error("no name()");
        },
      })
    );
    const { findings } = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    const label = MODULE_ADDR.slice(0, 10) + "…";
    expect(findingFor(findings, label)).toBeDefined();
  });

  it("reports a reverting moduleCheck as a failing finding with the revert detail", async () => {
    contracts.set(
      MODULE_ADDR,
      defaultModule({
        moduleCheck: async () => {
          throw new Error("custom revert reason");
        },
      })
    );
    const { findings } = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    const f = findingFor(findings, "MaxHolderCountModule");
    expect(f?.ok).toBe(false);
    expect(f?.detail).toContain("custom revert reason");
  });

  it("reports when module enumeration itself is unavailable", async () => {
    contracts.set(
      COMPLIANCE_ADDR,
      defaultCompliance({
        getModules: async () => {
          throw new Error("no getModules()");
        },
      })
    );
    const { findings } = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    expect(findingFor(findings, "énumération des modules")?.ok).toBe(false);
  });

  it("denies the transfer when canTransfer() returns false, even if every finding otherwise passes", async () => {
    contracts.set(COMPLIANCE_ADDR, defaultCompliance({ canTransfer: async () => false }));
    const result = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    expect(result.allowed).toBe(false);
    expect(findingFor(result.findings, "compliance.canTransfer")?.ok).toBe(false);
  });

  it("treats a reverting canTransfer() as a denial, without throwing", async () => {
    contracts.set(
      COMPLIANCE_ADDR,
      defaultCompliance({
        canTransfer: async () => {
          throw new Error("revert");
        },
      })
    );
    const result = await diagnose(provider, TOKEN_ADDR, FROM, TO, amount);
    expect(result.allowed).toBe(false);
  });
});
