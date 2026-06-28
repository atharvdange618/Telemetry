import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { createEventSchema, CreateEventInput } from "../lib/schemas";
import { createHash } from "crypto";

const BOT_PATTERN = /bot|crawler|spider|scrape|curl|wget|python-requests|python-urllib|go-http-client|java\/|php|ruby|perl| headless|phantom|selenium|puppeteer|playwright|ighthouse|pagespeed|webpagetest|monitor|uptime|healthcheck|check|test|feedfetcher|mediapartners|adsbot|googlebot|bingbot|yandexbot|baiduspider|duckduckbot|slurp|ia_archiver|semrushbot|ahrefbot|mj12bot|dotbot|petalbot|bytespider|gptbot|chatgpt-user|ccbot|claudebot|amazonbot|anthropic-ai|cohere-ai/i;

function isBot(ua: string): boolean {
  if (!ua || ua.length < 10) return true;
  return BOT_PATTERN.test(ua);
}

const TRACK_RATE_LIMIT = 30;
const TRACK_RATE_WINDOW = 60_000;
const trackHits = new Map<string, number[]>();

setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of trackHits) {
    const fresh = timestamps.filter((t) => now - t < TRACK_RATE_WINDOW);
    if (fresh.length === 0) trackHits.delete(ip);
    else trackHits.set(ip, fresh);
  }
}, TRACK_RATE_WINDOW);

function isTrackRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = trackHits.get(ip) || [];
  const fresh = timestamps.filter((t) => now - t < TRACK_RATE_WINDOW);
  if (fresh.length >= TRACK_RATE_LIMIT) return true;
  fresh.push(now);
  trackHits.set(ip, fresh);
  return false;
}

async function getGeoLocation(ip: string): Promise<{ country: string | null; city: string | null }> {
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.")) {
    return { country: null, city: null };
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`);
    const data = await res.json();
    return { country: data.country || null, city: data.city || null };
  } catch {
    return { country: null, city: null };
  }
}

export async function trackRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    if (request.url === "/api/track" && request.method === "POST") {
      if (isTrackRateLimited(request.ip)) {
        return reply.code(429).send({ message: "Rate limit exceeded" });
      }
      const ua = request.headers["user-agent"] || "";
      if (isBot(ua)) {
        return reply.code(403).send({ message: "Forbidden" });
      }
    }
  });

  app.post<{ Body: CreateEventInput }>(
    "/api/track",
    {
      schema: {
        body: createEventSchema,
      },
    },
    async (request, reply) => {
      const { tenantId, apiKey: providedApiKey, ...eventData } = request.body as CreateEventInput & { apiKey?: string };

      try {
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
        });

        if (!tenant) {
          return reply.code(404).send({ message: "Tenant not found" });
        }

        if (tenant.apiKey && tenant.apiKey !== providedApiKey) {
          return reply.code(403).send({ message: "Invalid API key" });
        }

        const ip = request.ip;
        const { country, city } = await getGeoLocation(ip);

        const userAgent = request.headers["user-agent"] || "";
        const salt = process.env.VISITOR_SALT!;
        const hashSource = `${ip}-${userAgent}-${tenant.id}-${salt}`;
        const visitorId = createHash("sha256").update(hashSource).digest("hex");

        const shared = {
          tenantId: tenant.id,
          visitorId,
          city,
          country,
          sessionId: eventData.sessionId || null,
          browser: eventData.browser || null,
          browserVersion: eventData.browserVersion || null,
          os: eventData.os || null,
          osVersion: eventData.osVersion || null,
          language: eventData.language || null,
        };

        const type = eventData.type;

        if (type === "pageview") {
          await prisma.event.create({
            data: {
              ...shared,
              type: "pageview",
              hostname: eventData.hostname,
              path: eventData.path,
              referrer: eventData.referrer || null,
              screenWidth: eventData.screenWidth || null,
              screenHeight: eventData.screenHeight || null,
              utmSource: eventData.utmSource || null,
              utmMedium: eventData.utmMedium || null,
              utmCampaign: eventData.utmCampaign || null,
              utmTerm: eventData.utmTerm || null,
              utmContent: eventData.utmContent || null,
              scrollDepth: eventData.scrollDepth || null,
            },
          });
        } else if (type === "goal") {
          await prisma.event.create({
            data: {
              ...shared,
              type: "goal",
              goalName: eventData.goalName,
              properties: eventData.properties as any || undefined,
            },
          });
        } else if (type === "outbound") {
          await prisma.event.create({
            data: {
              ...shared,
              type: "outbound",
              outboundUrl: eventData.url,
              outboundDomain: eventData.domain,
              path: eventData.path || null,
            },
          });
        } else if (type === "performance") {
          await prisma.event.create({
            data: {
              ...shared,
              type: "performance",
              path: eventData.path || null,
              lcp: eventData.lcp ?? null,
              fid: eventData.fid ?? null,
              cls: eventData.cls ?? null,
              ttfb: eventData.ttfb ?? null,
              fcp: eventData.fcp ?? null,
            },
          });
        } else if (type === "scroll") {
          await prisma.event.create({
            data: {
              ...shared,
              type: "scroll",
              path: eventData.path || null,
              scrollDepth: eventData.scrollDepth,
            },
          });
        }

        return reply.code(201).send({ message: "Event Received" });
      } catch (error) {
        app.log.error(error, "Failed to process event");
        return reply.code(500).send({ message: "Internal server error" });
      }
    }
  );
}
