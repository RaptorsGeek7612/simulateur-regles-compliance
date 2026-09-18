import { lookup } from "node:dns/promises";

/**
 * `rpcUrl` est fourni par le client et le serveur y fait des requêtes HTTP
 * pour son compte (via ethers.JsonRpcProvider) : sans ce garde-fou, un
 * visiteur peut pointer vers une adresse interne (service Railway privé,
 * 169.254.169.254/métadonnées cloud, localhost) et se servir du backend
 * comme relais SSRF. On résout le nom d'hôte et on rejette toute IP privée,
 * loopback, link-local ou non spécifiée — ça ne couvre pas le DNS rebinding
 * (TOCTOU entre cette résolution et celle que fera ethers), mais bloque les
 * attaques directes, largement le cas d'usage principal ici.
 */
export class SsrfBlockedError extends Error {}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true; // malformé -> prudence
  const [a, b] = parts;
  if (a === 127) return true; // loopback
  if (a === 10) return true; // privé
  if (a === 172 && b >= 16 && b <= 31) return true; // privé
  if (a === 192 && b === 168) return true; // privé
  if (a === 169 && b === 254) return true; // link-local, inclut les métadonnées cloud
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a === 0) return true; // "cette machine"
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1") return true; // loopback
  if (normalized === "::") return true; // non spécifiée
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // unique local (fc00::/7)
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) {
    return true; // link-local (fe80::/10)
  }
  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  return false;
}

export async function assertPublicRpcUrl(rpcUrl: string): Promise<void> {
  let hostname: string;
  try {
    hostname = new URL(rpcUrl).hostname;
  } catch {
    throw new SsrfBlockedError("URL RPC invalide.");
  }

  if (hostname === "localhost") {
    throw new SsrfBlockedError("RPC refusé : hôte local.");
  }

  let address: string;
  try {
    ({ address } = await lookup(hostname));
  } catch {
    throw new SsrfBlockedError("RPC refusé : résolution DNS impossible.");
  }

  const blocked = address.includes(":") ? isPrivateIPv6(address) : isPrivateIPv4(address);
  if (blocked) {
    throw new SsrfBlockedError("RPC refusé : cible réseau interne/privée non autorisée.");
  }
}
