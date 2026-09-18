import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch, ApiError } from "./client";

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the parsed JSON body on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ hello: "world" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiFetch<{ hello: string }>("/api/foo");

    expect(result).toEqual({ hello: "world" });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/foo",
      expect.objectContaining({ headers: expect.objectContaining({ "Content-Type": "application/json" }) })
    );
  });

  it("throws an ApiError with status 0 when the network request itself fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("network down"))
    );

    await expect(apiFetch("/api/foo")).rejects.toMatchObject({ status: 0 });
    await expect(apiFetch("/api/foo")).rejects.toBeInstanceOf(ApiError);
  });

  it("uses the plain string error message from a non-ok JSON body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => ({ error: "Lecture on-chain impossible : boom" }),
      })
    );

    await expect(apiFetch("/api/foo")).rejects.toMatchObject({
      status: 502,
      message: "Lecture on-chain impossible : boom",
    });
  });

  it("flattens a Zod fieldErrors object into a readable message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: { fieldErrors: { from: ["adresse Ethereum invalide"], amount: [] } },
        }),
      })
    );

    await expect(apiFetch("/api/foo")).rejects.toMatchObject({
      status: 400,
      message: "from: adresse Ethereum invalide",
    });
  });

  it("falls back to a generic message when the error body can't be parsed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("not json");
        },
      })
    );

    await expect(apiFetch("/api/foo")).rejects.toMatchObject({ status: 500, message: "Erreur 500" });
  });
});
