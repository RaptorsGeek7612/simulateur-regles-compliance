import { Router } from "express";
import { z } from "zod";
import { JsonRpcProvider } from "ethers";
import { diagnose } from "../onchain/diagnose.js";
import { runScenarios, type ScenarioCase } from "../onchain/scenarioRunner.js";
import { assertPublicRpcUrl, SsrfBlockedError } from "../onchain/ssrfGuard.js";

const addressSchema = z.string().regex(/^0x[0-9a-fA-F]{40}$/, "adresse Ethereum invalide");
const amountSchema = z.string().regex(/^[0-9]+$/, "montant invalide (entier en unités de base, chaîne de chiffres)");

const diagnoseSchema = z.object({
  rpcUrl: z.string().url().optional(),
  tokenAddress: addressSchema.optional(),
  from: addressSchema,
  to: addressSchema,
  amount: amountSchema,
});

const scenarioCaseSchema = z.object({
  name: z.string().min(1),
  from: addressSchema,
  to: addressSchema,
  amount: amountSchema,
  expect: z.enum(["allow", "deny"]),
});

const scenarioSchema = z.object({
  rpcUrl: z.string().url().optional(),
  tokenAddress: addressSchema.optional(),
  cases: z.array(scenarioCaseSchema).min(1).max(50, "50 cas maximum par requête"),
});

/**
 * `rpcUrl` fourni par le client passe par assertPublicRpcUrl() (garde SSRF) ;
 * RPC_URL côté serveur est une valeur de config admin, pas besoin de la
 * revalider à chaque requête.
 */
async function resolveProvider(rpcUrl?: string): Promise<JsonRpcProvider> {
  const url = rpcUrl || process.env.RPC_URL;
  if (!url) {
    throw new HttpError(400, "Aucun RPC_URL fourni (ni dans la requête, ni côté serveur).");
  }
  if (rpcUrl) {
    try {
      await assertPublicRpcUrl(rpcUrl);
    } catch (e) {
      if (e instanceof SsrfBlockedError) throw new HttpError(400, e.message);
      throw e;
    }
  }
  return new JsonRpcProvider(url);
}

function resolveToken(tokenAddress?: string): string {
  const addr = tokenAddress || process.env.TOKEN_ADDRESS;
  if (!addr) {
    throw new HttpError(400, "Aucune adresse de token fournie (ni dans la requête, ni côté serveur).");
  }
  return addr;
}

class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export const onchainRouter = Router();

onchainRouter.get("/config", (_req, res) => {
  res.json({
    hasDefaultRpc: Boolean(process.env.RPC_URL),
    defaultTokenAddress: process.env.TOKEN_ADDRESS || null,
  });
});

onchainRouter.post("/diagnose", async (req, res) => {
  const parsed = diagnoseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { rpcUrl, tokenAddress, from, to, amount } = parsed.data;

  try {
    const provider = await resolveProvider(rpcUrl);
    const token = resolveToken(tokenAddress);
    const result = await diagnose(provider, token, from, to, BigInt(amount));
    res.json(result);
  } catch (e) {
    if (e instanceof HttpError) {
      res.status(e.status).json({ error: e.message });
      return;
    }
    const message = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: `Lecture on-chain impossible : ${message}` });
  }
});

onchainRouter.post("/scenario", async (req, res) => {
  const parsed = scenarioSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { rpcUrl, tokenAddress, cases } = parsed.data;

  try {
    const provider = await resolveProvider(rpcUrl);
    const token = resolveToken(tokenAddress);
    const result = await runScenarios(provider, token, cases as ScenarioCase[]);
    res.json(result);
  } catch (e) {
    if (e instanceof HttpError) {
      res.status(e.status).json({ error: e.message });
      return;
    }
    const message = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: `Lecture on-chain impossible : ${message}` });
  }
});
