import { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma";
import { authHook } from "../hooks/auth";
import dayjs from "dayjs";
import {
  statsQuerySchema,
  funnelBodySchema,
  exportQuerySchema,
} from "../lib/schemas";

// Helper: resolve date range from query params
function resolveDateRange(query: {
  period?: string;
  startDate?: string;
  endDate?: string;
}) {
  if (query.startDate) {
    const start = new Date(query.startDate);
    const end = query.endDate ? new Date(query.endDate) : new Date();
    return { startDate: start, endDate: end };
  }
  const now = dayjs();
  const period = query.period || "24h";
  const unit = period.endsWith("d") ? "day" : "hour";
  const amount = parseInt(period);
  return {
    startDate: now.subtract(amount, unit).toDate(),
    endDate: now.toDate(),
  };
}

// Helper: build segment WHERE clause
function segmentFilters(query: Record<string, any>) {
  const where: Record<string, any> = {};
  if (query.browser) where.browser = query.browser;
  if (query.os) where.os = query.os;
  if (query.country) where.country = query.country;
  if (query.language) where.language = query.language;
  if (query.referrer) where.referrer = query.referrer;
  if (query.utmSource) where.utmSource = query.utmSource;
  if (query.device) {
    if (query.device === "mobile") where.screenWidth = { lt: 768 };
    else if (query.device === "tablet")
      where.screenWidth = { gte: 768, lte: 1024 };
    else where.screenWidth = { gt: 1024 };
  }
  return where;
}

// Helper: check tenant access
async function checkAccess(userId: string, tenantId: string) {
  const access = await prisma.tenantUser.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
  });
  return !!access;
}

// Helper: extract tenantId + period + segments from query
function parseQuery(request: any) {
  const parsed = statsQuerySchema.parse(request.query);
  const { startDate, endDate } = resolveDateRange(parsed);
  const segments = segmentFilters(parsed as Record<string, any>);
  return { tenantId: parsed.tenantId, startDate, endDate, segments };
}

export async function statsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authHook);

  // --- Summary ---
  app.get("/api/stats/summary", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const whereClause = {
        tenantId,
        createdAt: { gte: startDate, lte: endDate },
        type: "pageview",
        ...segments,
      };

      const pageViews = await prisma.event.count({ where: whereClause });

      const viewsPerVisitor = await prisma.event.groupBy({
        by: ["visitorId"],
        where: whereClause,
        _count: { id: true },
      });

      const uniqueVisitors = viewsPerVisitor.length;
      const bounces = viewsPerVisitor.filter((v) => v?._count?.id === 1).length;
      const bounceRate =
        uniqueVisitors > 0 ? (bounces / uniqueVisitors) * 100 : 0;

      return {
        pageViews,
        uniqueVisitors,
        bounceRate: parseFloat(bounceRate.toFixed(1)),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch summary stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Top Pages ---
  app.get("/api/stats/pages", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const topPages = await prisma.event.groupBy({
        by: ["path"],
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          type: "pageview",
          ...segments,
        },
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      });

      return {
        pages: topPages.map((p) => ({ path: p.path, views: p._count.path })),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch pages stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Referrers ---
  app.get("/api/stats/referrers", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const topReferrers = await prisma.event.groupBy({
        by: ["referrer"],
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          referrer: { not: null },
          type: "pageview",
          ...segments,
        },
        _count: { referrer: true },
        orderBy: { _count: { referrer: "desc" } },
        take: 10,
      });

      return {
        referrers: topReferrers.map((r) => ({
          referrer: r.referrer === "" ? "Direct" : r.referrer,
          views: r._count.referrer,
        })),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch referrers stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Views Over Time ---
  app.get("/api/stats/views-over-time", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const diffMs = endDate.getTime() - startDate.getTime();
      const isHourly = diffMs < 2 * 24 * 60 * 60 * 1000;

      const events = await prisma.event.findMany({
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          type: "pageview",
          ...segments,
        },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      });

      const buckets = new Map<string, number>();
      for (const e of events) {
        const d = new Date(e.createdAt);
        let key: string;
        if (isHourly) {
          key = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            d.getHours(),
          ).toISOString();
        } else {
          key = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
          ).toISOString();
        }
        buckets.set(key, (buckets.get(key) || 0) + 1);
      }

      const views = [...buckets.entries()]
        .map(([date, count]) => ({ date, views: count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return { views };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch views-over-time stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- UTM Sources ---
  app.get("/api/stats/sources", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const topSources = await prisma.event.groupBy({
        by: ["utmSource"],
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          utmSource: { not: null },
          ...segments,
        },
        _count: { utmSource: true },
        orderBy: { _count: { utmSource: "desc" } },
        take: 10,
      });

      return {
        sources: topSources.map((s) => ({
          source: s.utmSource,
          views: s._count.utmSource,
        })),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch sources stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Goals ---
  app.get("/api/stats/goals", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const topGoals = await prisma.event.groupBy({
        by: ["goalName"],
        where: {
          tenantId,
          type: "goal",
          createdAt: { gte: startDate, lte: endDate },
          goalName: { not: null },
          ...segments,
        },
        _count: { goalName: true },
        orderBy: { _count: { goalName: "desc" } },
        take: 10,
      });

      return {
        goals: topGoals.map((g) => ({
          name: g.goalName,
          completions: g._count.goalName,
        })),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch goals stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Locations ---
  app.get("/api/stats/locations", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const topCountries = await prisma.event.groupBy({
        by: ["country"],
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          country: { not: null },
          ...segments,
        },
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
        take: 20,
      });

      return {
        locations: topCountries.map((c) => ({
          country: c.country,
          views: c._count.country,
        })),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch locations stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Devices ---
  app.get("/api/stats/devices", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const events = await prisma.event.findMany({
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          type: "pageview",
          screenWidth: { not: null },
          ...segments,
        },
        select: { screenWidth: true },
      });

      let mobile = 0,
        tablet = 0,
        desktop = 0;
      for (const e of events) {
        const w = e.screenWidth!;
        if (w < 768) mobile++;
        else if (w <= 1024) tablet++;
        else desktop++;
      }

      return { devices: { mobile, tablet, desktop } };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch devices stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Engagement ---
  app.get("/api/stats/engagement", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const whereClause = {
        tenantId,
        createdAt: { gte: startDate, lte: endDate },
        type: "pageview",
        ...segments,
      };

      const viewsPerVisitor = await prisma.event.groupBy({
        by: ["visitorId"],
        where: whereClause,
        _count: { id: true },
        orderBy: { visitorId: "asc" },
      });

      const totalVisitors = viewsPerVisitor.length;
      const totalPages = viewsPerVisitor.reduce(
        (sum, v) => sum + v._count.id,
        0,
      );
      const avgPagesPerSession =
        totalVisitors > 0 ? totalPages / totalVisitors : 0;

      // New vs returning: check if visitor had events in the period before
      const durationMs = endDate.getTime() - startDate.getTime();
      const prevStart = new Date(startDate.getTime() - durationMs);

      const prevVisitorIds = await prisma.event.findMany({
        where: {
          tenantId,
          createdAt: { gte: prevStart, lt: startDate },
          type: "pageview",
          ...segments,
        },
        select: { visitorId: true },
        distinct: ["visitorId"],
      });
      const prevVisitorSet = new Set(prevVisitorIds.map((v) => v.visitorId));

      const returning = viewsPerVisitor.filter((v) =>
        prevVisitorSet.has(v.visitorId),
      ).length;
      const newVisitors = totalVisitors - returning;

      return {
        avgPagesPerSession: parseFloat(avgPagesPerSession.toFixed(1)),
        newVisitors,
        returningVisitors: returning,
        totalVisitors,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch engagement stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Campaigns ---
  app.get("/api/stats/campaigns", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const whereClause = {
        tenantId,
        createdAt: { gte: startDate, lte: endDate },
        ...segments,
      };

      const [byMedium, byCampaign] = await Promise.all([
        prisma.event.groupBy({
          by: ["utmMedium"],
          where: { ...whereClause, utmMedium: { not: null } },
          _count: { utmMedium: true },
          orderBy: { _count: { utmMedium: "desc" } },
          take: 10,
        }),
        prisma.event.groupBy({
          by: ["utmCampaign"],
          where: { ...whereClause, utmCampaign: { not: null } },
          _count: { utmCampaign: true },
          orderBy: { _count: { utmCampaign: "desc" } },
          take: 10,
        }),
      ]);

      return {
        mediums: byMedium.map((m) => ({
          medium: m.utmMedium,
          views: m._count.utmMedium,
        })),
        campaigns: byCampaign.map((c) => ({
          campaign: c.utmCampaign,
          views: c._count.utmCampaign,
        })),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch campaigns stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Cities ---
  app.get("/api/stats/cities", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const topCities = await prisma.event.groupBy({
        by: ["city"],
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          city: { not: null },
          ...segments,
        },
        _count: { city: true },
        orderBy: { _count: { city: "desc" } },
        take: 20,
      });

      return {
        cities: topCities.map((c) => ({ city: c.city, views: c._count.city })),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch cities stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Compare ---
  app.get("/api/stats/compare", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const durationMs = endDate.getTime() - startDate.getTime();
      const prevStart = new Date(startDate.getTime() - durationMs);
      const prevEnd = startDate;

      const baseWhere = { type: "pageview" as const, ...segments };

      const [currentViews, prevViews] = await Promise.all([
        prisma.event.count({
          where: {
            tenantId,
            createdAt: { gte: startDate, lte: endDate },
            ...baseWhere,
          },
        }),
        prisma.event.count({
          where: {
            tenantId,
            createdAt: { gte: prevStart, lt: prevEnd },
            ...baseWhere,
          },
        }),
      ]);

      const [currentVisitors, prevVisitors] = await Promise.all([
        prisma.event.findMany({
          where: {
            tenantId,
            createdAt: { gte: startDate, lte: endDate },
            ...baseWhere,
          },
          select: { visitorId: true },
          distinct: ["visitorId"],
        }),
        prisma.event.findMany({
          where: {
            tenantId,
            createdAt: { gte: prevStart, lt: prevEnd },
            ...baseWhere,
          },
          select: { visitorId: true },
          distinct: ["visitorId"],
        }),
      ]);

      const pctChange = (curr: number, prev: number) =>
        prev > 0
          ? parseFloat((((curr - prev) / prev) * 100).toFixed(1))
          : curr > 0
            ? 100
            : 0;

      return {
        pageViews: {
          current: currentViews,
          previous: prevViews,
          change: pctChange(currentViews, prevViews),
        },
        uniqueVisitors: {
          current: currentVisitors.length,
          previous: prevVisitors.length,
          change: pctChange(currentVisitors.length, prevVisitors.length),
        },
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch compare stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Browsers ---
  app.get("/api/stats/browsers", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const total = await prisma.event.count({
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          type: "pageview",
          ...segments,
        },
      });

      const topBrowsers = await prisma.event.groupBy({
        by: ["browser"],
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          type: "pageview",
          browser: { not: null },
          ...segments,
        },
        _count: { browser: true },
        orderBy: { _count: { browser: "desc" } },
        take: 10,
      });

      return {
        browsers: topBrowsers.map((b) => ({
          browser: b.browser,
          views: b._count.browser,
          percentage:
            total > 0
              ? parseFloat(((b._count.browser / total) * 100).toFixed(1))
              : 0,
        })),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch browser stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- OS ---
  app.get("/api/stats/os", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const total = await prisma.event.count({
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          type: "pageview",
          ...segments,
        },
      });

      const topOS = await prisma.event.groupBy({
        by: ["os"],
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          type: "pageview",
          os: { not: null },
          ...segments,
        },
        _count: { os: true },
        orderBy: { _count: { os: "desc" } },
        take: 10,
      });

      return {
        operatingSystems: topOS.map((o) => ({
          os: o.os,
          views: o._count.os,
          percentage:
            total > 0
              ? parseFloat(((o._count.os / total) * 100).toFixed(1))
              : 0,
        })),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch OS stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Languages ---
  app.get("/api/stats/languages", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const total = await prisma.event.count({
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          type: "pageview",
          ...segments,
        },
      });

      const topLangs = await prisma.event.groupBy({
        by: ["language"],
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          type: "pageview",
          language: { not: null },
          ...segments,
        },
        _count: { language: true },
        orderBy: { _count: { language: "desc" } },
        take: 10,
      });

      return {
        languages: topLangs.map((l) => ({
          language: l.language,
          views: l._count.language,
          percentage:
            total > 0
              ? parseFloat(((l._count.language / total) * 100).toFixed(1))
              : 0,
        })),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch language stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Sessions ---
  app.get("/api/stats/sessions", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const whereClause = {
        tenantId,
        createdAt: { gte: startDate, lte: endDate },
        type: "pageview",
        ...segments,
      };

      const sessions = await prisma.event.groupBy({
        by: ["sessionId"],
        where: { ...whereClause, sessionId: { not: null } },
        _count: { id: true },
        _min: { createdAt: true },
        _max: { createdAt: true },
      });

      const totalSessions = sessions.length;
      let totalDurationMs = 0;

      for (const s of sessions) {
        if (s._min.createdAt && s._max.createdAt) {
          totalDurationMs +=
            s._max.createdAt.getTime() - s._min.createdAt.getTime();
        }
      }

      const avgDurationSec =
        totalSessions > 0 ? totalDurationMs / totalSessions / 1000 : 0;

      return {
        totalSessions,
        avgDurationSeconds: Math.round(avgDurationSec),
        avgDurationFormatted: formatDuration(avgDurationSec),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch session stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Scroll Depth ---
  app.get("/api/stats/scroll-depth", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const scrollEvents = await prisma.event.findMany({
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          type: "scroll",
          scrollDepth: { not: null },
          ...segments,
        },
        select: { scrollDepth: true },
      });

      const depths = scrollEvents.map((e) => e.scrollDepth!);
      const avg =
        depths.length > 0
          ? depths.reduce((a, b) => a + b, 0) / depths.length
          : 0;

      const distribution = {
        at25: depths.filter((d) => d >= 25).length,
        at50: depths.filter((d) => d >= 50).length,
        at75: depths.filter((d) => d >= 75).length,
        at100: depths.filter((d) => d >= 100).length,
      };

      return {
        avgScrollDepth: Math.round(avg),
        totalScrollEvents: depths.length,
        distribution,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch scroll depth stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Performance (Web Vitals) ---
  app.get("/api/stats/performance", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const perfEvents = await prisma.event.findMany({
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          type: "performance",
          ...segments,
        },
        select: { lcp: true, fid: true, cls: true, ttfb: true, fcp: true },
      });

      const calcPercentile = (values: number[], p: number) => {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const idx = Math.ceil((p / 100) * sorted.length) - 1;
        return sorted[Math.max(0, idx)];
      };

      const extract = (field: "lcp" | "fid" | "cls" | "ttfb" | "fcp") =>
        perfEvents.map((e) => e[field]).filter((v): v is number => v !== null);

      const lcp = extract("lcp"),
        fid = extract("fid"),
        cls = extract("cls"),
        ttfb = extract("ttfb"),
        fcp = extract("fcp");

      const calcMetric = (values: number[]) => ({
        p50: Math.round(calcPercentile(values, 50)),
        p75: Math.round(calcPercentile(values, 75)),
        p90: Math.round(calcPercentile(values, 90)),
        p99: Math.round(calcPercentile(values, 99)),
        count: values.length,
      });

      return {
        lcp: calcMetric(lcp),
        fid: calcMetric(fid),
        cls: {
          ...calcMetric(cls),
          p50: parseFloat(calcPercentile(cls, 50).toFixed(3)),
          p75: parseFloat(calcPercentile(cls, 75).toFixed(3)),
          p90: parseFloat(calcPercentile(cls, 90).toFixed(3)),
          p99: parseFloat(calcPercentile(cls, 99).toFixed(3)),
        },
        ttfb: calcMetric(ttfb),
        fcp: calcMetric(fcp),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch performance stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Outbound Links ---
  app.get("/api/stats/outbound", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const topOutbound = await prisma.event.groupBy({
        by: ["outboundUrl"],
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          type: "outbound",
          outboundUrl: { not: null },
          ...segments,
        },
        _count: { outboundUrl: true },
        orderBy: { _count: { outboundUrl: "desc" } },
        take: 20,
      });

      return {
        outboundLinks: topOutbound.map((o) => ({
          url: o.outboundUrl,
          clicks: o._count.outboundUrl,
        })),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch outbound stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Funnel Analysis ---
  app.post("/api/stats/funnels", async (request, reply) => {
    try {
      const body = funnelBodySchema.parse(request.body);
      if (!(await checkAccess(request.userId!, body.tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const { startDate, endDate } = resolveDateRange(body);
      const steps = body.steps;

      const funnelSteps: { step: string; visitors: number }[] = [];
      for (let i = 0; i < steps.length; i++) {
        const visitors = await prisma.event.findMany({
          where: {
            tenantId: body.tenantId,
            createdAt: { gte: startDate, lte: endDate },
            type: "pageview",
            path: steps[i],
          },
          select: { visitorId: true },
          distinct: ["visitorId"],
        });
        funnelSteps.push({ step: steps[i], visitors: visitors.length });
      }

      // Build funnel with conversion rates
      const result = funnelSteps.map((s, i) => ({
        step: s.step,
        visitors: s.visitors,
        conversionFromPrevious:
          i === 0
            ? 100
            : funnelSteps[i - 1].visitors > 0
              ? parseFloat(
                  ((s.visitors / funnelSteps[i - 1].visitors) * 100).toFixed(1),
                )
              : 0,
        conversionFromFirst:
          funnelSteps[0].visitors > 0
            ? parseFloat(
                ((s.visitors / funnelSteps[0].visitors) * 100).toFixed(1),
              )
            : 0,
      }));

      return { funnel: result };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid body", errors: error.issues });
      }
      app.log.error(error, "Failed to compute funnel");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Cohort / Retention ---
  app.get("/api/stats/cohorts", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const allVisitors = await prisma.event.findMany({
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          type: "pageview",
          ...segments,
        },
        select: { visitorId: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      });

      const visitorFirstVisit = new Map<string, Date>();
      for (const v of allVisitors) {
        if (!visitorFirstVisit.has(v.visitorId)) {
          visitorFirstVisit.set(v.visitorId, v.createdAt);
        }
      }

      const cohorts = new Map<string, Set<string>>();
      for (const [visitorId, firstVisit] of visitorFirstVisit) {
        const weekKey = dayjs(firstVisit).format("YYYY-[W]ww");
        if (!cohorts.has(weekKey)) cohorts.set(weekKey, new Set());
        cohorts.get(weekKey)!.add(visitorId);
      }

      const cohortResult = [];
      const sortedCohorts = [...cohorts.entries()].sort((a, b) =>
        a[0].localeCompare(b[0]),
      );

      for (const [cohortWeek, visitorIds] of sortedCohorts.slice(-8)) {
        const cohortData: Record<string, number> = { cohort: visitorIds.size };

        for (let w = 0; w <= 7; w++) {
          const weekStart = dayjs(cohortWeek, "YYYY-[W]ww")
            .add(w, "week")
            .toDate();
          const weekEnd = dayjs(weekStart).add(1, "week").toDate();

          if (weekEnd > endDate) break;

          const returningVisitors = await prisma.event.findMany({
            where: {
              tenantId,
              createdAt: { gte: weekStart, lt: weekEnd },
              type: "pageview",
              visitorId: { in: [...visitorIds] },
              ...segments,
            },
            select: { visitorId: true },
            distinct: ["visitorId"],
          });

          cohortData[`week${w}`] = returningVisitors.length;
        }

        cohortResult.push({
          cohort: cohortWeek,
          totalVisitors: visitorIds.size,
          ...cohortData,
        });
      }

      return { cohorts: cohortResult };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch cohort stats");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Automated Insights ---
  app.get("/api/stats/insights", async (request, reply) => {
    try {
      const { tenantId, startDate, endDate, segments } = parseQuery(request);
      if (!(await checkAccess(request.userId!, tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const durationMs = endDate.getTime() - startDate.getTime();
      const prevStart = new Date(startDate.getTime() - durationMs);
      const insights: {
        type: string;
        title: string;
        detail: string;
        value: number;
      }[] = [];

      const [currViews, prevViews] = await Promise.all([
        prisma.event.count({
          where: {
            tenantId,
            createdAt: { gte: startDate, lte: endDate },
            type: "pageview",
            ...segments,
          },
        }),
        prisma.event.count({
          where: {
            tenantId,
            createdAt: { gte: prevStart, lt: startDate },
            type: "pageview",
            ...segments,
          },
        }),
      ]);

      if (prevViews > 0) {
        const change = ((currViews - prevViews) / prevViews) * 100;
        if (Math.abs(change) > 10) {
          insights.push({
            type: "trend",
            title: `Page views ${change > 0 ? "up" : "down"} ${Math.abs(Math.round(change))}%`,
            detail: `${currViews.toLocaleString()} vs ${prevViews.toLocaleString()} in previous period`,
            value: Math.round(change),
          });
        }
      }

      const [currVisitors, prevVisitors] = await Promise.all([
        prisma.event.findMany({
          where: {
            tenantId,
            createdAt: { gte: startDate, lte: endDate },
            type: "pageview",
            ...segments,
          },
          select: { visitorId: true },
          distinct: ["visitorId"],
        }),
        prisma.event.findMany({
          where: {
            tenantId,
            createdAt: { gte: prevStart, lt: startDate },
            type: "pageview",
            ...segments,
          },
          select: { visitorId: true },
          distinct: ["visitorId"],
        }),
      ]);

      if (prevVisitors.length > 0) {
        const change =
          ((currVisitors.length - prevVisitors.length) / prevVisitors.length) *
          100;
        if (Math.abs(change) > 10) {
          insights.push({
            type: "trend",
            title: `Visitors ${change > 0 ? "up" : "down"} ${Math.abs(Math.round(change))}%`,
            detail: `${currVisitors.length} vs ${prevVisitors.length} in previous period`,
            value: Math.round(change),
          });
        }
      }

      const currPages = await prisma.event.groupBy({
        by: ["path"],
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          type: "pageview",
          ...segments,
        },
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 20,
      });

      const prevPages = await prisma.event.groupBy({
        by: ["path"],
        where: {
          tenantId,
          createdAt: { gte: prevStart, lt: startDate },
          type: "pageview",
          ...segments,
        },
        _count: { path: true },
      });

      const prevPageMap = new Map(
        prevPages.map((p) => [p.path, p._count.path]),
      );

      for (const page of currPages.slice(0, 5)) {
        const prevCount = prevPageMap.get(page.path) || 0;
        if (prevCount > 0) {
          const growth = ((page._count.path - prevCount) / prevCount) * 100;
          if (growth > 50) {
            insights.push({
              type: "trending_page",
              title: `Trending: ${page.path}`,
              detail: `Views grew ${Math.round(growth)}% (${prevCount} → ${page._count.path})`,
              value: Math.round(growth),
            });
          }
        }
      }

      const topRef = await prisma.event.groupBy({
        by: ["referrer"],
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          type: "pageview",
          referrer: { not: null },
          ...segments,
        },
        _count: { referrer: true },
        orderBy: { _count: { referrer: "desc" } },
        take: 1,
      });

      if (topRef.length > 0 && topRef[0]._count.referrer > 10) {
        insights.push({
          type: "referrer",
          title: `Top referrer: ${topRef[0].referrer}`,
          detail: `${topRef[0]._count.referrer} visits from this source`,
          value: topRef[0]._count.referrer,
        });
      }

      return { insights };
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to fetch insights");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  // --- Data Export ---
  app.get("/api/export/events", async (request, reply) => {
    try {
      const parsed = exportQuerySchema.parse(request.query);
      if (!(await checkAccess(request.userId!, parsed.tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const { startDate, endDate } = resolveDateRange(parsed);

      const events = await prisma.event.findMany({
        where: {
          tenantId: parsed.tenantId,
          createdAt: { gte: startDate, lte: endDate },
        },
        orderBy: { createdAt: "desc" },
        take: parsed.limit,
      });

      if (parsed.format === "csv") {
        reply.header("Content-Type", "text/csv");
        reply.header("Content-Disposition", "attachment; filename=events.csv");

        const headers = [
          "id",
          "type",
          "path",
          "hostname",
          "referrer",
          "visitorId",
          "sessionId",
          "browser",
          "os",
          "language",
          "country",
          "city",
          "utmSource",
          "utmMedium",
          "utmCampaign",
          "scrollDepth",
          "lcp",
          "fid",
          "cls",
          "ttfb",
          "fcp",
          "outboundUrl",
          "goalName",
          "createdAt",
        ];
        const csvRows = [headers.join(",")];

        for (const e of events) {
          const row = headers.map((h) => {
            const val = (e as any)[h];
            if (val === null || val === undefined) return "";
            const str = String(val);
            return str.includes(",") || str.includes('"') || str.includes("\n")
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          });
          csvRows.push(row.join(","));
        }

        return reply.send(csvRows.join("\n"));
      }

      return reply.send({ events, total: events.length });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .code(400)
          .send({ message: "Invalid query parameters", errors: error.issues });
      }
      app.log.error(error, "Failed to export events");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600)
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
