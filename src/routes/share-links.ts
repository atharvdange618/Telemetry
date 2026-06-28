import { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { randomBytes } from "crypto";
import { authHook } from "../hooks/auth";
import { prisma } from "../lib/prisma";
import {
  shareLinkBodySchema,
  shareLinkParamsSchema,
} from "../lib/schemas";

function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

function resolveDateRange(query: {
  period?: string;
  startDate?: string;
  endDate?: string;
}) {
  const now = new Date();
  if (query.startDate && query.endDate) {
    return { startDate: new Date(query.startDate), endDate: new Date(query.endDate) };
  }
  const periodMap: Record<string, number> = {
    "24h": 1,
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };
  const days = periodMap[query.period || "24h"] || 1;
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);
  return { startDate, endDate: now };
}

function segmentFilters(config: Record<string, string | undefined>) {
  const filters: Record<string, string> = {};
  if (config.browser) filters.browser = config.browser;
  if (config.os) filters.os = config.os;
  if (config.country) filters.country = config.country;
  if (config.language) filters.language = config.language;
  if (config.device) filters.device = config.device;
  return filters;
}

export async function shareLinksRoutes(app: FastifyInstance) {

  app.addHook("preHandler", authHook);

  app.post("/api/share-links", async (request, reply) => {
    try {
      const userId = request.userId!;
      const body = shareLinkBodySchema.parse(request.body);

      const access = await prisma.tenantUser.findUnique({
        where: { userId_tenantId: { userId, tenantId: body.tenantId } },
      });
      if (!access) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const token = generateToken();
      const shareLink = await prisma.shareLink.create({
        data: {
          token,
          tenantId: body.tenantId,
          label: body.label || null,
          config: body.config,
          createdBy: userId,
        },
      });

      return reply.code(201).send({ shareLink });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid request body", errors: error.issues });
      }
      app.log.error(error, "Failed to create share link");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  app.get("/api/share-links", async (request, reply) => {
    try {
      const userId = request.userId!;
      const { tenantId } = request.query as { tenantId?: string };

      if (!tenantId) {
        return reply.code(400).send({ message: "tenantId is required" });
      }

      const access = await prisma.tenantUser.findUnique({
        where: { userId_tenantId: { userId, tenantId } },
      });
      if (!access) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const shareLinks = await prisma.shareLink.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
      });

      return { shareLinks };
    } catch (error) {
      app.log.error(error, "Failed to list share links");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  app.delete("/api/share-links/:id", async (request, reply) => {
    try {
      const userId = request.userId!;
      const { id } = shareLinkParamsSchema.parse(request.params);

      const shareLink = await prisma.shareLink.findUnique({ where: { id } });
      if (!shareLink) {
        return reply.code(404).send({ message: "Share link not found" });
      }

      if (shareLink.createdBy !== userId) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      await prisma.shareLink.delete({ where: { id } });
      return reply.code(204).send();
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid request params", errors: error.issues });
      }
      app.log.error(error, "Failed to delete share link");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  app.get("/api/shared/:token", async (request, reply) => {
    try {
      const { token } = request.params as { token: string };
      const shareLink = await prisma.shareLink.findUnique({
        where: { token },
        include: { user: { select: { name: true } } },
      });

      if (!shareLink) {
        return reply.code(404).send({ message: "Share link not found" });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id: shareLink.tenantId },
        select: { name: true },
      });

      return {
        id: shareLink.id,
        label: shareLink.label || tenant?.name || "Dashboard",
        config: shareLink.config,
        createdAt: shareLink.createdAt,
      };
    } catch (error) {
      app.log.error(error, "Failed to fetch share link");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  app.get("/api/shared/:token/stats/:type", async (request, reply) => {
    try {
      const { token, type } = request.params as { token: string; type: string };
      const shareLink = await prisma.shareLink.findUnique({ where: { token } });

      if (!shareLink) {
        return reply.code(404).send({ message: "Share link not found" });
      }

      const config = shareLink.config as Record<string, any>;
      const query = request.query as Record<string, string>;

      const params = {
        tenantId: shareLink.tenantId,
        period: query.period || config.period || "24h",
        startDate: query.startDate || config.startDate,
        endDate: query.endDate || config.endDate,
        ...((config.segments as Record<string, string>) || {}),
      };

      const { startDate, endDate } = resolveDateRange(params);
      const segments = segmentFilters(params as Record<string, string>);

      const statsHandlers: Record<
        string,
        () => Promise<any>
      > = {
        summary: async () => {
          const [pageViews, uniqueVisitors, bounceEvents] = await Promise.all([
            prisma.event.count({
              where: {
                tenantId: params.tenantId,
                createdAt: { gte: startDate, lte: endDate },
                type: "pageview",
                ...segments,
              },
            }),
            prisma.event
              .groupBy({
                by: ["visitorId"],
                where: {
                  tenantId: params.tenantId,
                  createdAt: { gte: startDate, lte: endDate },
                  type: "pageview",
                  ...segments,
                },
              })
              .then((r) => r.length),
            prisma.event.groupBy({
              by: ["visitorId"],
              where: {
                tenantId: params.tenantId,
                createdAt: { gte: startDate, lte: endDate },
                type: "pageview",
                ...segments,
              },
              _count: true,
            }),
          ]);

          const singlePageVisitors = bounceEvents.filter(
            (e: any) => e._count === 1,
          ).length;
          const bounceRate =
            uniqueVisitors > 0
              ? parseFloat(((singlePageVisitors / uniqueVisitors) * 100).toFixed(1))
              : 0;

          return { pageViews, uniqueVisitors, bounceRate };
        },

        pages: async () => {
          const pages = await prisma.event.groupBy({
            by: ["path"],
            where: {
              tenantId: params.tenantId,
              createdAt: { gte: startDate, lte: endDate },
              type: "pageview",
              path: { not: null },
              ...segments,
            },
            _count: true,
            orderBy: { _count: { path: "desc" } },
            take: 10,
          });
          return { pages: pages.map((p) => ({ path: p.path!, views: p._count })) };
        },

        referrers: async () => {
          const refs = await prisma.event.groupBy({
            by: ["referrer"],
            where: {
              tenantId: params.tenantId,
              createdAt: { gte: startDate, lte: endDate },
              type: "pageview",
              referrer: { not: null },
              ...segments,
            },
            _count: true,
            orderBy: { _count: { referrer: "desc" } },
            take: 10,
          });
          return { referrers: refs.map((r) => ({ referrer: r.referrer!, views: r._count })) };
        },

        "views-over-time": async () => {
          const events = await prisma.event.findMany({
            where: {
              tenantId: params.tenantId,
              createdAt: { gte: startDate, lte: endDate },
              type: "pageview",
              ...segments,
            },
            select: { createdAt: true },
          });

          const isHourly =
            endDate.getTime() - startDate.getTime() <= 24 * 60 * 60 * 1000;
          const bucketMap = new Map<string, number>();

          for (const e of events) {
            const d = new Date(e.createdAt);
            const key = isHourly
              ? `${d.toISOString().slice(0, 13)}:00:00.000Z`
              : d.toISOString().slice(0, 10);
            bucketMap.set(key, (bucketMap.get(key) || 0) + 1);
          }

          const views = [...bucketMap.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, views]) => ({ date, views }));

          return { views };
        },

        sources: async () => {
          const sources = await prisma.event.groupBy({
            by: ["utmSource"],
            where: {
              tenantId: params.tenantId,
              createdAt: { gte: startDate, lte: endDate },
              type: "pageview",
              utmSource: { not: null },
              ...segments,
            },
            _count: true,
            orderBy: { _count: { utmSource: "desc" } },
            take: 10,
          });
          return {
            sources: sources.map((s) => ({
              source: s.utmSource!,
              views: s._count,
            })),
          };
        },

        goals: async () => {
          const goals = await prisma.event.groupBy({
            by: ["goalName"],
            where: {
              tenantId: params.tenantId,
              createdAt: { gte: startDate, lte: endDate },
              type: "goal",
              goalName: { not: null },
              ...segments,
            },
            _count: true,
            orderBy: { _count: { goalName: "desc" } },
            take: 10,
          });
          return {
            goals: goals.map((g) => ({
              name: g.goalName!,
              completions: g._count,
            })),
          };
        },

        locations: async () => {
          const locs = await prisma.event.groupBy({
            by: ["country"],
            where: {
              tenantId: params.tenantId,
              createdAt: { gte: startDate, lte: endDate },
              type: "pageview",
              country: { not: null },
              ...segments,
            },
            _count: true,
            orderBy: { _count: { country: "desc" } },
            take: 20,
          });
          return {
            locations: locs.map((l) => ({
              country: l.country!,
              views: l._count,
            })),
          };
        },

        cities: async () => {
          const cities = await prisma.event.groupBy({
            by: ["city"],
            where: {
              tenantId: params.tenantId,
              createdAt: { gte: startDate, lte: endDate },
              type: "pageview",
              city: { not: null },
              ...segments,
            },
            _count: true,
            orderBy: { _count: { city: "desc" } },
            take: 20,
          });
          return {
            cities: cities.map((c) => ({ city: c.city!, views: c._count })),
          };
        },

        devices: async () => {
          const all = await prisma.event.findMany({
            where: {
              tenantId: params.tenantId,
              createdAt: { gte: startDate, lte: endDate },
              type: "pageview",
              ...segments,
            },
            select: { screenWidth: true },
          });

          const devices = { mobile: 0, tablet: 0, desktop: 0 };
          for (const e of all) {
            const w = e.screenWidth || 0;
            if (w <= 768) devices.mobile++;
            else if (w <= 1024) devices.tablet++;
            else devices.desktop++;
          }
          return { devices };
        },

        engagement: async () => {
          const events = await prisma.event.findMany({
            where: {
              tenantId: params.tenantId,
              createdAt: { gte: startDate, lte: endDate },
              type: "pageview",
              ...segments,
            },
            select: { visitorId: true, sessionId: true, createdAt: true },
          });

          const visitorSessions = new Map<string, Set<string>>();
          const visitorFirstSeen = new Map<string, Date>();

          for (const e of events) {
            if (!visitorSessions.has(e.visitorId)) {
              visitorSessions.set(e.visitorId, new Set());
            }
            if (e.sessionId) visitorSessions.get(e.visitorId)!.add(e.sessionId);
            if (!visitorFirstSeen.has(e.visitorId)) {
              visitorFirstSeen.set(e.visitorId, e.createdAt);
            }
          }

          const totalVisitors = visitorSessions.size;
          const totalSessions = [...visitorSessions.values()].reduce(
            (sum, s) => sum + Math.max(s.size, 1),
            0,
          );
          const avgPagesPerSession =
            totalSessions > 0
              ? parseFloat((events.length / totalSessions).toFixed(1))
              : 0;

          const now = new Date();
          let newVisitors = 0;
          for (const [_, first] of visitorFirstSeen) {
            const diff = now.getTime() - first.getTime();
            if (diff <= 24 * 60 * 60 * 1000) newVisitors++;
          }

          return {
            avgPagesPerSession,
            newVisitors,
            returningVisitors: totalVisitors - newVisitors,
            totalVisitors,
          };
        },

        campaigns: async () => {
          const [mediums, campaigns] = await Promise.all([
            prisma.event.groupBy({
              by: ["utmMedium"],
              where: {
                tenantId: params.tenantId,
                createdAt: { gte: startDate, lte: endDate },
                type: "pageview",
                utmMedium: { not: null },
                ...segments,
              },
              _count: true,
              orderBy: { _count: { utmMedium: "desc" } },
              take: 10,
            }),
            prisma.event.groupBy({
              by: ["utmCampaign"],
              where: {
                tenantId: params.tenantId,
                createdAt: { gte: startDate, lte: endDate },
                type: "pageview",
                utmCampaign: { not: null },
                ...segments,
              },
              _count: true,
              orderBy: { _count: { utmCampaign: "desc" } },
              take: 10,
            }),
          ]);
          return {
            mediums: mediums.map((m) => ({
              medium: m.utmMedium!,
              views: m._count,
            })),
            campaigns: campaigns.map((c) => ({
              campaign: c.utmCampaign!,
              views: c._count,
            })),
          };
        },

        compare: async () => {
          const diffMs = endDate.getTime() - startDate.getTime();
          const prevStart = new Date(startDate.getTime() - diffMs);
          const prevEnd = new Date(startDate);

          const [curr, prev] = await Promise.all([
            prisma.event.findMany({
              where: {
                tenantId: params.tenantId,
                createdAt: { gte: startDate, lte: endDate },
                type: "pageview",
                ...segments,
              },
              select: { visitorId: true },
            }),
            prisma.event.findMany({
              where: {
                tenantId: params.tenantId,
                createdAt: { gte: prevStart, lte: prevEnd },
                type: "pageview",
                ...segments,
              },
              select: { visitorId: true },
            }),
          ]);

          const currVisitors = new Set(curr.map((e) => e.visitorId)).size;
          const prevVisitors = new Set(prev.map((e) => e.visitorId)).size;

          const change =
            prevVisitors > 0
              ? parseFloat(
                (
                  ((currVisitors - prevVisitors) / prevVisitors) *
                  100
                ).toFixed(1),
              )
              : 0;

          return {
            pageViews: { current: curr.length, previous: prev.length, change },
            uniqueVisitors: {
              current: currVisitors,
              previous: prevVisitors,
              change,
            },
          };
        },

        browsers: async () => {
          const browsers = await prisma.event.groupBy({
            by: ["browser"],
            where: {
              tenantId: params.tenantId,
              createdAt: { gte: startDate, lte: endDate },
              type: "pageview",
              browser: { not: null },
              ...segments,
            },
            _count: true,
            orderBy: { _count: { browser: "desc" } },
            take: 10,
          });
          const total = browsers.reduce((s, b) => s + b._count, 0);
          return {
            browsers: browsers.map((b) => ({
              browser: b.browser!,
              views: b._count,
              percentage:
                total > 0
                  ? parseFloat(((b._count / total) * 100).toFixed(1))
                  : 0,
            })),
          };
        },

        os: async () => {
          const os = await prisma.event.groupBy({
            by: ["os"],
            where: {
              tenantId: params.tenantId,
              createdAt: { gte: startDate, lte: endDate },
              type: "pageview",
              os: { not: null },
              ...segments,
            },
            _count: true,
            orderBy: { _count: { os: "desc" } },
            take: 10,
          });
          const total = os.reduce((s, o) => s + o._count, 0);
          return {
            operatingSystems: os.map((o) => ({
              os: o.os!,
              views: o._count,
              percentage:
                total > 0
                  ? parseFloat(((o._count / total) * 100).toFixed(1))
                  : 0,
            })),
          };
        },

        languages: async () => {
          const langs = await prisma.event.groupBy({
            by: ["language"],
            where: {
              tenantId: params.tenantId,
              createdAt: { gte: startDate, lte: endDate },
              type: "pageview",
              language: { not: null },
              ...segments,
            },
            _count: true,
            orderBy: { _count: { language: "desc" } },
            take: 10,
          });
          const total = langs.reduce((s, l) => s + l._count, 0);
          return {
            languages: langs.map((l) => ({
              language: l.language!,
              views: l._count,
              percentage:
                total > 0
                  ? parseFloat(((l._count / total) * 100).toFixed(1))
                  : 0,
            })),
          };
        },

        sessions: async () => {
          const events = await prisma.event.findMany({
            where: {
              tenantId: params.tenantId,
              createdAt: { gte: startDate, lte: endDate },
              type: "pageview",
              ...segments,
            },
            select: { visitorId: true, sessionId: true, createdAt: true },
          });

          const sessions = new Map<string, { start: Date; end: Date }>();
          for (const e of events) {
            const key = `${e.visitorId}-${e.sessionId || "default"}`;
            const existing = sessions.get(key);
            if (!existing) {
              sessions.set(key, { start: e.createdAt, end: e.createdAt });
            } else {
              if (e.createdAt < existing.start) existing.start = e.createdAt;
              if (e.createdAt > existing.end) existing.end = e.createdAt;
            }
          }

          let totalDuration = 0;
          for (const s of sessions.values()) {
            totalDuration += s.end.getTime() - s.start.getTime();
          }

          const avgMs = sessions.size > 0 ? totalDuration / sessions.size : 0;
          const avgSec = Math.round(avgMs / 1000);
          const min = Math.floor(avgSec / 60);
          const sec = avgSec % 60;

          return {
            totalSessions: sessions.size,
            avgDurationSeconds: avgSec,
            avgDurationFormatted: `${min}m ${sec}s`,
          };
        },

        "scroll-depth": async () => {
          const events = await prisma.event.findMany({
            where: {
              tenantId: params.tenantId,
              createdAt: { gte: startDate, lte: endDate },
              type: "scroll",
              scrollDepth: { not: null },
              ...segments,
            },
            select: { scrollDepth: true },
          });

          const total = events.length;
          const avg =
            total > 0
              ? Math.round(
                events.reduce((s, e) => s + (e.scrollDepth || 0), 0) / total,
              )
              : 0;

          const distribution = { at25: 0, at50: 0, at75: 0, at100: 0 };
          for (const e of events) {
            const d = e.scrollDepth || 0;
            if (d >= 25) distribution.at25++;
            if (d >= 50) distribution.at50++;
            if (d >= 75) distribution.at75++;
            if (d >= 100) distribution.at100++;
          }

          return { avgScrollDepth: avg, totalScrollEvents: total, distribution };
        },

        performance: async () => {
          const metrics = ["lcp", "fid", "cls", "ttfb", "fcp"] as const;
          const result: Record<string, any> = {};

          for (const m of metrics) {
            const values = await prisma.event.findMany({
              where: {
                tenantId: params.tenantId,
                createdAt: { gte: startDate, lte: endDate },
                type: "performance",
                [m]: { not: null },
                ...segments,
              },
              select: { [m]: true },
            });

            const nums = values.map((v: any) => v[m] as number).sort((a, b) => a - b);
            const count = nums.length;
            const percentile = (p: number) =>
              count > 0 ? nums[Math.floor((p / 100) * (count - 1))] : 0;

            result[m] = {
              p50: percentile(50),
              p75: percentile(75),
              p90: percentile(90),
              p99: percentile(99),
              count,
            };
          }

          return result;
        },

        outbound: async () => {
          const links = await prisma.event.groupBy({
            by: ["outboundUrl"],
            where: {
              tenantId: params.tenantId,
              createdAt: { gte: startDate, lte: endDate },
              type: "outbound",
              outboundUrl: { not: null },
              ...segments,
            },
            _count: true,
            orderBy: { _count: { outboundUrl: "desc" } },
            take: 20,
          });
          return {
            outboundLinks: links.map((l) => ({
              url: l.outboundUrl!,
              clicks: l._count,
            })),
          };
        },

        insights: async () => {
          return { insights: [] };
        },
      };

      const handler = statsHandlers[type];
      if (!handler) {
        return reply.code(400).send({ message: `Unknown stats type: ${type}` });
      }

      const data = await handler();
      return data;
    } catch (error) {
      app.log.error(error, "Failed to fetch shared stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });
}
