import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../onchain/diagnose.js", () => ({ diagnose: vi.fn() }));
vi.mock("../onchain/scenarioRunner.js", () => ({ runScenarios: vi.fn() }));

import { onchainRouter } from "../api/onchain.js";
import { diagnose } from "../onchain/diagnose.js";
import { runScenarios } from "../onchain/scenarioRunner.js";
import { startTestServer, type TestServer } from "./testServer.js";

const mockDiagnose = vi.mocked(diagnose);
const mockRunScenarios = vi.mocked(runScenarios);

const FROM = "0x1111111111111111111111111111111111111111";
const TO = "0x2222222222222222222222222222222222222222";

let server: TestServer;
const originalEnv = { ...process.env };

beforeAll(async () => {
  server = await startTestServer("/api/onchain", onchainRouter);
});

afterAll(() => server.close());

beforeEach(() => {
  process.env.RPC_URL = "https://example.invalid/rpc";
  process.env.TOKEN_ADDRESS = "0x3333333333333333333333333333333333333333";
});

afterEach(() => {
  process.env = { ...originalEnv };
  vi.clearAllMocks();
});

describe("GET /api/onchain/config", () => {
  it("reports whether a default RPC/token is configured server-side", async () => {
    const res = await fetch(`${server.baseUrl}/api/onchain/config`);
    expect(await res.json()).toEqual({
      hasDefaultRpc: true,
      defaultTokenAddress: "0x3333333333333333333333333333333333333333",
    });
  });

  it("reports nulls when nothing is configured server-side", async () => {
    delete process.env.RPC_URL;
    delete process.env.TOKEN_ADDRESS;
    const res = await fetch(`${server.baseUrl}/api/onchain/config`);
    expect(await res.json()).toEqual({ hasDefaultRpc: false, defaultTokenAddress: null });
  });
});

describe("POST /api/onchain/diagnose", () => {
  it("calls diagnose() with the resolved provider/token and returns its result", async () => {
    mockDiagnose.mockResolvedValueOnce({ allowed: true, findings: [] });

    const res = await fetch(`${server.baseUrl}/api/onchain/diagnose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: TO, amount: "1000" }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ allowed: true, findings: [] });
    expect(mockDiagnose).toHaveBeenCalledWith(
      expect.anything(),
      "0x3333333333333333333333333333333333333333",
      FROM,
      TO,
      1000n
    );
  });

  it("rejects an invalid address with a 400", async () => {
    const res = await fetch(`${server.baseUrl}/api/onchain/diagnose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: "not-an-address", to: TO, amount: "1000" }),
    });
    expect(res.status).toBe(400);
    expect(mockDiagnose).not.toHaveBeenCalled();
  });

  it("returns a 400 when no RPC URL is available, from the request or the server", async () => {
    delete process.env.RPC_URL;
    const res = await fetch(`${server.baseUrl}/api/onchain/diagnose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: TO, amount: "1000" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/RPC_URL/);
  });

  it("rejects a client-supplied private/internal rpcUrl with a 400 (SSRF guard), without calling diagnose", async () => {
    const res = await fetch(`${server.baseUrl}/api/onchain/diagnose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rpcUrl: "http://169.254.169.254", from: FROM, to: TO, amount: "1000" }),
    });
    expect(res.status).toBe(400);
    expect(mockDiagnose).not.toHaveBeenCalled();
  });

  it("accepts a client-supplied rpcUrl pointing at a public IP literal", async () => {
    mockDiagnose.mockResolvedValueOnce({ allowed: true, findings: [] });
    const res = await fetch(`${server.baseUrl}/api/onchain/diagnose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rpcUrl: "http://8.8.8.8:8545", from: FROM, to: TO, amount: "1000" }),
    });
    expect(res.status).toBe(200);
    expect(mockDiagnose).toHaveBeenCalled();
  });

  it("returns a 502 when the on-chain read itself fails", async () => {
    mockDiagnose.mockRejectedValueOnce(new Error("connection refused"));
    const res = await fetch(`${server.baseUrl}/api/onchain/diagnose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: TO, amount: "1000" }),
    });
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toContain("connection refused");
  });
});

describe("POST /api/onchain/scenario", () => {
  it("calls runScenarios() with the parsed cases and returns its result", async () => {
    mockRunScenarios.mockResolvedValueOnce({ results: [], summary: { passed: 0, total: 0 } });

    const res = await fetch(`${server.baseUrl}/api/onchain/scenario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cases: [{ name: "c1", from: FROM, to: TO, amount: "1", expect: "allow" }],
      }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ results: [], summary: { passed: 0, total: 0 } });
    expect(mockRunScenarios).toHaveBeenCalledTimes(1);
  });

  it("rejects an empty case list with a 400", async () => {
    const res = await fetch(`${server.baseUrl}/api/onchain/scenario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cases: [] }),
    });
    expect(res.status).toBe(400);
    expect(mockRunScenarios).not.toHaveBeenCalled();
  });

  it("rejects more than 50 cases in a single request with a 400", async () => {
    const cases = Array.from({ length: 51 }, (_, i) => ({ name: `c${i}`, from: FROM, to: TO, amount: "1", expect: "allow" }));
    const res = await fetch(`${server.baseUrl}/api/onchain/scenario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cases }),
    });
    expect(res.status).toBe(400);
    expect(mockRunScenarios).not.toHaveBeenCalled();
  });

  it("rejects a case with an invalid expect value", async () => {
    const res = await fetch(`${server.baseUrl}/api/onchain/scenario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cases: [{ name: "c1", from: FROM, to: TO, amount: "1", expect: "maybe" }],
      }),
    });
    expect(res.status).toBe(400);
  });
});
