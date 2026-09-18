import { describe, expect, it } from "vitest";
import { assertPublicRpcUrl, SsrfBlockedError } from "../onchain/ssrfGuard.js";

describe("assertPublicRpcUrl", () => {
  it("rejects loopback addresses, by literal IP and by 'localhost'", async () => {
    await expect(assertPublicRpcUrl("http://127.0.0.1:8545")).rejects.toBeInstanceOf(SsrfBlockedError);
    await expect(assertPublicRpcUrl("http://localhost:8545")).rejects.toBeInstanceOf(SsrfBlockedError);
  });

  it("rejects RFC1918 private ranges", async () => {
    await expect(assertPublicRpcUrl("http://10.0.0.5:8545")).rejects.toBeInstanceOf(SsrfBlockedError);
    await expect(assertPublicRpcUrl("http://172.16.0.5:8545")).rejects.toBeInstanceOf(SsrfBlockedError);
    await expect(assertPublicRpcUrl("http://192.168.1.5:8545")).rejects.toBeInstanceOf(SsrfBlockedError);
  });

  it("rejects the cloud metadata link-local address", async () => {
    await expect(assertPublicRpcUrl("http://169.254.169.254/latest/meta-data")).rejects.toBeInstanceOf(SsrfBlockedError);
  });

  it("rejects IPv6 loopback and unique-local addresses", async () => {
    await expect(assertPublicRpcUrl("http://[::1]:8545")).rejects.toBeInstanceOf(SsrfBlockedError);
    await expect(assertPublicRpcUrl("http://[fd00::1]:8545")).rejects.toBeInstanceOf(SsrfBlockedError);
  });

  it("rejects a malformed URL", async () => {
    await expect(assertPublicRpcUrl("not-a-url")).rejects.toBeInstanceOf(SsrfBlockedError);
  });

  it("allows a public IP address", async () => {
    // 8.8.8.8 (Google DNS) — a real, stable, unambiguously public address.
    await expect(assertPublicRpcUrl("http://8.8.8.8:8545")).resolves.toBeUndefined();
  });
});
