import type { FastifyBaseLogger } from "fastify";
import { prisma } from "./prisma";

// Catches a site whose events suddenly stop arriving, like the six weeks
// of broken cross-origin tracking that nobody noticed until a user did.
const CHECK_INTERVAL_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
// Below this many events a day, normal swings look like outages.
const MIN_DAILY_BASELINE = 20;
// Alert when the last 24h drop under this share of a normal day.
const DROP_RATIO = 0.3;
// Discord rejects messages over 2000 characters.
const MAX_LISTED = 15;

export interface TenantVolume {
  tenantId: string;
  name: string;
  last24h: number;
  dailyBaseline: number;
}

export function findDrops(volumes: TenantVolume[]): TenantVolume[] {
  return volumes.filter(
    (v) =>
      v.dailyBaseline >= MIN_DAILY_BASELINE &&
      v.last24h < v.dailyBaseline * DROP_RATIO,
  );
}

// Last 24h per tenant, against the average day over the 7 days before.
// Tenants with no recent events still appear, with last24h = 0.
// ponytail: scans 8 days of events hourly; move to a daily rollup table if
// this query shows up in slow-query logs.
export async function getTenantVolumes(now: Date): Promise<TenantVolume[]> {
  const dayAgo = new Date(now.getTime() - DAY_MS);
  const eightDaysAgo = new Date(now.getTime() - 8 * DAY_MS);

  const [recent, baseline, tenants] = await Promise.all([
    prisma.event.groupBy({
      by: ["tenantId"],
      where: { createdAt: { gte: dayAgo } },
      _count: { _all: true },
    }),
    prisma.event.groupBy({
      by: ["tenantId"],
      where: { createdAt: { gte: eightDaysAgo, lt: dayAgo } },
      _count: { _all: true },
    }),
    prisma.tenant.findMany({ select: { id: true, name: true } }),
  ]);

  const recentBy = new Map(recent.map((r) => [r.tenantId, r._count._all]));
  const baselineBy = new Map(baseline.map((r) => [r.tenantId, r._count._all]));

  return tenants.map((t) => ({
    tenantId: t.id,
    name: t.name,
    last24h: recentBy.get(t.id) ?? 0,
    dailyBaseline: (baselineBy.get(t.id) ?? 0) / 7,
  }));
}

export async function sendDiscordAlert(
  webhookUrl: string,
  drops: TenantVolume[],
): Promise<void> {
  const lines = drops
    .slice(0, MAX_LISTED)
    .map(
      (d) =>
        `- ${d.name} (${d.tenantId}): ${d.last24h} events in the last 24h, usually about ${Math.round(d.dailyBaseline)} a day`,
    );
  if (drops.length > MAX_LISTED) {
    lines.push(`- and ${drops.length - MAX_LISTED} more`);
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `Event volume dropped on ${drops.length} site(s):\n${lines.join("\n")}`,
      // Site names are user input. Never let one ping @everyone.
      allowed_mentions: { parse: [] },
    }),
  });
  if (!res.ok) throw new Error(`Discord webhook returned ${res.status}`);
}

export function startIngestionAlerts(log: FastifyBaseLogger): void {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) {
    log.warn("ALERT_WEBHOOK_URL is not set, so ingestion alerts are off");
    return;
  }

  // One alert per site per day. ponytail: in memory, so a restart can
  // repeat an alert for a drop that's still ongoing.
  const lastAlerted = new Map<string, number>();

  const check = async () => {
    try {
      const now = Date.now();
      const drops = findDrops(await getTenantVolumes(new Date(now))).filter(
        (d) => now - (lastAlerted.get(d.tenantId) ?? 0) >= DAY_MS,
      );
      if (drops.length === 0) return;
      await sendDiscordAlert(webhookUrl, drops);
      for (const d of drops) lastAlerted.set(d.tenantId, now);
    } catch (error) {
      log.error(error, "Ingestion alert check failed");
    }
  };

  setInterval(check, CHECK_INTERVAL_MS).unref();
  void check();
}
