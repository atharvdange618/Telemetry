// Fills a site with ~180 days of fake traffic for local development.
//
// Run it inside the api container so it hits the Docker database, not
// whatever DATABASE_URL your host .env points at:
//   docker compose run --rm --no-deps api npm run seed [-- you@example.com]
//
// It targets the given user's site, or the first user who signed in.
// Seeded events use a "seed_" visitorId prefix, so rerunning replaces
// them and never touches real events.
import { Prisma, PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();
const DAYS = 180; // twice the longest period, so 90d comparisons have data
const SEED_PREFIX = "seed_";

// Seeded PRNG so every run produces the same dataset.
let state = 42;
function rand(): number {
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const between = (min: number, max: number) => min + rand() * (max - min);
const pick = <T>(items: readonly T[]): T => items[Math.floor(rand() * items.length)];
function weighted<T>(options: readonly (readonly [T, number])[]): T {
  let roll = rand() * options.reduce((sum, [, w]) => sum + w, 0);
  for (const [value, w] of options) {
    roll -= w;
    if (roll <= 0) return value;
  }
  return options[options.length - 1][0];
}

const PLACES = [
  ["India", "Pune", "hi-IN", 4], ["India", "Bengaluru", "en-IN", 3],
  ["United States", "San Francisco", "en-US", 4], ["United States", "New York", "en-US", 3],
  ["Germany", "Berlin", "de-DE", 2], ["United Kingdom", "London", "en-GB", 2],
  ["France", "Paris", "fr-FR", 1], ["Japan", "Tokyo", "ja-JP", 1],
  ["Brazil", "São Paulo", "pt-BR", 1], ["Canada", "Toronto", "en-CA", 1],
] as const;

interface Device {
  w: number;
  width: number;
  height: number;
  combos: [browser: string, os: string, osVersion: string][];
}
const DEVICES: Device[] = [
  { w: 55, width: 1920, height: 1080, combos: [["Chrome", "Windows", "10"], ["Edge", "Windows", "10"], ["Firefox", "Linux", ""], ["Chrome", "macOS", "10.15"], ["Safari", "macOS", "10.15"]] },
  { w: 35, width: 390, height: 844, combos: [["Safari", "iOS", "17.5"], ["Chrome", "Android", "14"]] },
  { w: 10, width: 820, height: 1180, combos: [["Safari", "iOS", "17.5"], ["Chrome", "Android", "13"]] },
];

// Page flow: where a visitor goes next from each page (null = leaves).
const NEXT: Record<string, readonly (readonly [string | null, number])[]> = {
  "/": [["/pricing", 35], ["/docs", 20], ["/blog/privacy-first-analytics", 10], [null, 35]],
  "/pricing": [["/signup", 30], ["/docs", 10], [null, 60]],
  "/signup": [["/checkout", 50], [null, 50]],
  "/checkout": [["/thanks", 60], [null, 40]],
  "/thanks": [[null, 1]],
  "/docs": [["/docs/installation", 40], ["/pricing", 15], [null, 45]],
  "/docs/installation": [["/pricing", 20], [null, 80]],
  "/blog/privacy-first-analytics": [["/", 20], ["/pricing", 10], [null, 70]],
  "/blog/core-web-vitals": [["/", 15], ["/docs", 15], [null, 70]],
};
const ENTRY = [["/", 50], ["/blog/privacy-first-analytics", 20], ["/docs", 15], ["/pricing", 10], ["/blog/core-web-vitals", 5]] as const;

const REFERRERS = [
  [null, 40], ["https://www.google.com/", 30], ["https://github.com/", 10],
  ["https://t.co/", 8], ["https://www.reddit.com/", 7], ["https://duckduckgo.com/", 5],
] as const;
const CAMPAIGNS = [
  { utmSource: "newsletter", utmMedium: "email", utmCampaign: "october-update" },
  { utmSource: "twitter", utmMedium: "social", utmCampaign: "launch-week" },
  { utmSource: "producthunt", utmMedium: "referral", utmCampaign: "launch-week" },
] as const;

interface Visitor {
  id: string;
  width: number;
  height: number;
  browser: string;
  os: string;
  osVersion: string;
  country: string;
  city: string;
  language: string;
  mobile: boolean;
}

function newVisitor(n: number): Visitor {
  const device = weighted(DEVICES.map((d) => [d, d.w] as const));
  const [browser, os, osVersion] = pick(device.combos);
  const [country, city, language] = weighted(PLACES.map((p) => [p, p[3]] as const));
  return {
    id: `${SEED_PREFIX}${n.toString(16).padStart(8, "0")}`,
    width: device.width, height: device.height,
    browser, os, osVersion, country, city, language,
    mobile: device.width < 768,
  };
}

// Sessions per day: steady growth, quieter weekends, and one launch spike.
function sessionsOn(daysAgo: number, date: Date): number {
  const growth = 1 + (0.8 * (DAYS - daysAgo)) / DAYS;
  const weekend = date.getDay() === 0 || date.getDay() === 6 ? 0.7 : 1;
  const spike = daysAgo === 20 ? 3 : daysAgo === 19 ? 1.6 : 1;
  return Math.round(40 * growth * weekend * spike * between(0.8, 1.2));
}

// Most traffic lands between late morning and night.
const HOURS = Array.from({ length: 24 }, (_, h) => [h, h < 7 ? 1 : h < 10 ? 3 : h < 23 ? 6 : 2] as const);

async function main() {
  const email = process.argv[2];
  const user = email
    ? await prisma.user.findUnique({ where: { email } })
    : await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) throw new Error("No user found. Sign in once with GitHub, then rerun.");

  const membership = await prisma.tenantUser.findFirst({
    where: { userId: user.id, role: "ADMIN" },
    include: { tenant: true },
  });
  if (!membership) throw new Error(`${user.email} has no site to seed.`);
  const tenantId = membership.tenantId;

  const removed = await prisma.event.deleteMany({
    where: { tenantId, visitorId: { startsWith: SEED_PREFIX } },
  });

  const now = new Date();
  const visitors: Visitor[] = [];
  const events: Prisma.EventCreateManyInput[] = [];

  for (let daysAgo = DAYS; daysAgo >= 0; daysAgo--) {
    const day = new Date(now);
    day.setDate(now.getDate() - daysAgo);

    for (let s = 0; s < sessionsOn(daysAgo, day); s++) {
      const time = new Date(day);
      time.setHours(weighted(HOURS), Math.floor(rand() * 60), Math.floor(rand() * 60));
      if (time > now) continue;

      // About a quarter of sessions come from someone seen in the last month.
      const recent = visitors.slice(-1200);
      let visitor: Visitor;
      if (recent.length > 0 && rand() < 0.25) {
        visitor = pick(recent);
      } else {
        visitor = newVisitor(visitors.length);
        visitors.push(visitor);
      }

      const sessionId = `${visitor.id}-${daysAgo}-${s}`;
      const campaign = daysAgo <= 25 && rand() < 0.15 ? pick(CAMPAIGNS) : null;
      const referrer = daysAgo === 20 && rand() < 0.6 ? "https://news.ycombinator.com/" : weighted(REFERRERS);
      const shared = {
        tenantId, visitorId: visitor.id, sessionId,
        country: visitor.country, city: visitor.city,
        browser: visitor.browser, browserVersion: visitor.browser === "Safari" ? "17" : "129",
        os: visitor.os, osVersion: visitor.osVersion, language: visitor.language,
      };

      let path: string | null = weighted(ENTRY);
      let first = true;
      while (path && time <= now) {
        events.push({
          ...shared, type: "pageview", createdAt: new Date(time),
          hostname: "example.com", path,
          referrer: first ? referrer : "https://example.com/",
          screenWidth: visitor.width, screenHeight: visitor.height,
          ...(first && campaign ? campaign : {}),
        });

        if (rand() < 0.6) {
          events.push({ ...shared, type: "scroll", path, createdAt: new Date(time.getTime() + 20_000), scrollDepth: Math.round(between(15, 100)) });
        }
        if (rand() < 0.5) {
          const slow = visitor.mobile ? 1.6 : 1;
          events.push({
            ...shared, type: "performance", path, createdAt: new Date(time.getTime() + 5_000),
            lcp: Math.round(between(900, 2800) * slow), inp: Math.round(between(40, 260) * slow),
            cls: Number(between(0, 0.18).toFixed(3)), ttfb: Math.round(between(80, 600)),
            fcp: Math.round(between(500, 1800) * slow),
          });
        }
        if (path === "/checkout") {
          events.push({ ...shared, type: "goal", goalName: "Signup", createdAt: new Date(time), properties: { plan: pick(["hobby", "pro"]) } });
        }
        if (path === "/thanks") {
          events.push({ ...shared, type: "goal", goalName: "Purchase", createdAt: new Date(time), properties: { plan: "pro", value: 9 } });
        }
        if ((path.startsWith("/docs") || path.startsWith("/blog")) && rand() < 0.08) {
          const url = pick(["https://github.com/atharvdange618/Telemetry", "https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon", "https://web.dev/articles/vitals"]);
          events.push({ ...shared, type: "outbound", path, createdAt: new Date(time.getTime() + 30_000), outboundUrl: url, outboundDomain: new URL(url).hostname });
        }

        time.setSeconds(time.getSeconds() + Math.round(between(15, 180)));
        path = weighted(NEXT[path]);
        first = false;
      }
    }
  }

  for (let i = 0; i < events.length; i += 5000) {
    await prisma.event.createMany({ data: events.slice(i, i + 5000) });
  }

  console.log(
    `Seeded ${events.length} events from ${visitors.length} visitors into "${membership.tenant.name}" (${user.email}).` +
      (removed.count ? ` Replaced ${removed.count} earlier seed events.` : ""),
  );
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
