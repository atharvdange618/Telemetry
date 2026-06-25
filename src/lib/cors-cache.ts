import { prisma } from "./prisma";

let allowedOrigins: Set<string> = new Set();
let lastFetch = 0;
const CACHE_TTL = 60_000;

export async function refreshOrigins() {
  const tenants = await prisma.tenant.findMany({
    select: { domains: true },
  });
  allowedOrigins = new Set(tenants.flatMap((t) => t.domains));
  lastFetch = Date.now();
}

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  if (origin === process.env.FRONTEND_URL) return true;
  if (Date.now() - lastFetch >= CACHE_TTL) {
    refreshOrigins().catch((err) => {
      console.error("Failed to refresh CORS origins:", err.message);
    });
  }
  return allowedOrigins.has(origin);
}

export function invalidateOriginCache() {
  lastFetch = 0;
}
