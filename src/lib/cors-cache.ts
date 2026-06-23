import { prisma } from "./prisma";

let allowedOrigins: Set<string> = new Set();
let lastFetch = 0;
const CACHE_TTL = 60_000;

export async function getAllowedOrigins(): Promise<Set<string>> {
  const now = Date.now();
  if (now - lastFetch >= CACHE_TTL) {
    const tenants = await prisma.tenant.findMany({
      select: { domains: true },
    });
    allowedOrigins = new Set(tenants.flatMap((t) => t.domains));
    lastFetch = now;
  }
  return allowedOrigins;
}

export function invalidateOriginCache() {
  lastFetch = 0;
}
