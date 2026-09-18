import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { micaRouter } from "../api/mica.js";
import { EMPTY_QUESTIONNAIRE, type QuestionnaireAnswers } from "../engine/questionnaire.js";
import { startTestServer, type TestServer } from "./testServer.js";

let server: TestServer;

beforeAll(async () => {
  server = await startTestServer("/api/mica", micaRouter);
});

afterAll(() => server.close());

describe("GET /api/mica/questionnaire-template", () => {
  it("returns the empty questionnaire shape", async () => {
    const res = await fetch(`${server.baseUrl}/api/mica/questionnaire-template`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(EMPTY_QUESTIONNAIRE);
  });
});

describe("GET /api/mica/module-map", () => {
  it("returns a non-empty array of module/rule links", async () => {
    const res = await fetch(`${server.baseUrl}/api/mica/module-map`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty("moduleName");
  });
});

describe("POST /api/mica/evaluate", () => {
  it("evaluates a valid questionnaire and returns rule results", async () => {
    const answers: QuestionnaireAnswers = {
      ...EMPTY_QUESTIONNAIRE,
      role: { isIssuer: true, isCASP: false },
      token: { ...EMPTY_QUESTIONNAIRE.token, referencesSingleFiatCurrency: true },
    };

    const res = await fetch(`${server.baseUrl}/api/mica/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    const ruleIds = body.results.map((r: { ruleId: string }) => r.ruleId);
    expect(ruleIds).toContain("classification-emt");
  });

  it("rejects a malformed questionnaire with a 400 and field errors", async () => {
    const res = await fetch(`${server.baseUrl}/api/mica/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: { isIssuer: true } }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("rejects a body with the wrong types", async () => {
    const res = await fetch(`${server.baseUrl}/api/mica/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...EMPTY_QUESTIONNAIRE, token: { ...EMPTY_QUESTIONNAIRE.token, offerValueEUR12m: "lots" } }),
    });

    expect(res.status).toBe(400);
  });
});
