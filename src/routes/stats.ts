import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authHook } from "../hooks/auth";
import dayjs from "dayjs";
import { statsQuerySchema } from "../lib/schemas";

export async function statsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authHook);

  app.get("/api/stats/summary", async (request, reply) => {
    const { tenantId, period } = statsQuerySchema.parse(request.query);
    const requestingUserId = request.userId!;

    const tenantAccess = await prisma.tenantUser.findUnique({
      where: {
        userId_tenantId: {
          userId: requestingUserId!,
          tenantId: tenantId,
        },
      },
    });

    if (!tenantAccess) {
      return reply.code(403).send({ message: "Forbidden: Access denied" });
    }

    const now = dayjs();
    const startDate = now
      .subtract(parseInt(period), period.endsWith("d") ? "day" : "hour")
      .toDate();
    const whereClause = { tenantId, createdAt: { gte: startDate } };

    // get total page views
    const pageViews = await prisma.event.count({ where: whereClause });

    // get views per visitor
    const viewsPerVisitor = await prisma.event.groupBy({
      by: ["visitorId"],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    // Calculate unique visitors and bounces
    const uniqueVisitors = viewsPerVisitor.length;
    const bounces = viewsPerVisitor.filter((v) => v?._count?.id === 1).length;
    const bounceRate =
      uniqueVisitors > 0 ? (bounces / uniqueVisitors) * 100 : 0;

    return {
      pageViews,
      uniqueVisitors,
      bounceRate: parseFloat(bounceRate.toFixed(1)),
    };
  });

  app.get("/api/stats/pages", async (request, reply) => {
    const { tenantId, period } = statsQuerySchema.parse(request.query);
    const requestingUserId = request.userId!;
    const tenantAccess = await prisma.tenantUser.findUnique({
      where: { userId_tenantId: { userId: requestingUserId, tenantId } },
    });

    if (!tenantAccess) {
      return reply.code(403).send({ message: "Forbidden: Access denied" });
    }

    // date range
    const startDate = dayjs()
      .subtract(parseInt(period), period.endsWith("d") ? "day" : "hour")
      .toDate();

    const topPages = await prisma.event.groupBy({
      by: ["path"], // Group all events by their path
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        path: true, // Count the occurrences of each path
      },
      orderBy: {
        _count: {
          path: "desc", // Order by the count in descending order
        },
      },
      take: 10, // Limit to the top 10 results
    });

    const pages = topPages.map((p) => ({
      path: p.path,
      views: p._count.path,
    }));

    return { pages };
  });

  app.get("/api/stats/referrers", async (request, reply) => {
    const { tenantId, period } = statsQuerySchema.parse(request.query);
    const requestingUserId = request.userId!;
    const tenantAccess = await prisma.tenantUser.findUnique({
      where: { userId_tenantId: { userId: requestingUserId, tenantId } },
    });

    if (!tenantAccess) {
      return reply.code(403).send({ message: "Forbidden: Access denied" });
    }

    const startDate = dayjs()
      .subtract(parseInt(period), period.endsWith("d") ? "day" : "hour")
      .toDate();

    const topReferrers = await prisma.event.groupBy({
      by: ["referrer"],
      where: {
        tenantId: tenantId,
        createdAt: { gte: startDate },
        referrer: { not: null },
      },
      _count: {
        referrer: true,
      },
      orderBy: {
        _count: {
          referrer: "desc",
        },
      },
      take: 10,
    });

    const referrers = topReferrers.map((r) => ({
      referrer: r.referrer === "" ? "Direct" : r.referrer,
      views: r._count.referrer,
    }));

    return { referrers };
  });

  app.get("/api/stats/views-over-time", async (request, reply) => {
    const { tenantId, period } = statsQuerySchema.parse(request.query);
    const requestingUserId = request.userId!;
    const tenantAccess = await prisma.tenantUser.findUnique({
      where: { userId_tenantId: { userId: requestingUserId, tenantId } },
    });

    if (!tenantAccess) {
      return reply.code(403).send({ message: "Forbidden: Access denied" });
    }

    const startDate = dayjs()
      .subtract(parseInt(period), period.endsWith("d") ? "day" : "hour")
      .toDate();

    const dateTruncFormat = period === "24h" ? "hour" : "day";

    const views = await prisma.$queryRaw`
    SELECT
      DATE_TRUNC(${dateTruncFormat}, "createdAt") as date,
      COUNT(id) as views
    FROM "Event"
    WHERE "tenantId" = ${tenantId} AND "createdAt" >= ${startDate}
    GROUP BY date
    ORDER BY date ASC;
  `;

    const formattedViews = (views as any[]).map((v) => ({
      date: v.date.toISOString(),
      views: Number(v.views),
    }));

    return { views: formattedViews };
  });

  app.get("/api/stats/sources", async (request, reply) => {
    const { tenantId, period } = statsQuerySchema.parse(request.query);
    const requestingUserId = request.userId!;
    const tenantAccess = await prisma.tenantUser.findUnique({
      where: { userId_tenantId: { userId: requestingUserId, tenantId } },
    });

    if (!tenantAccess) {
      return reply.code(403).send({ message: "Forbidden: Access denied" });
    }

    const startDate = dayjs()
      .subtract(parseInt(period), period.endsWith("d") ? "day" : "hour")
      .toDate();

    const topSources = await prisma.event.groupBy({
      by: ["utmSource"],
      where: {
        tenantId,
        createdAt: { gte: startDate },
        utmSource: { not: null },
      },
      _count: {
        utmSource: true,
      },
      orderBy: {
        _count: {
          utmSource: "desc",
        },
      },
      take: 10,
    });

    const sources = topSources.map((s) => ({
      source: s.utmSource,
      views: s._count.utmSource,
    }));

    return { sources };
  });

  app.get("/api/stats/goals", async (request, reply) => {
    const { tenantId, period } = statsQuerySchema.parse(request.query);
    const requestingUserId = request.userId!;
    const tenantAccess = await prisma.tenantUser.findUnique({
      where: { userId_tenantId: { userId: requestingUserId, tenantId } },
    });

    if (!tenantAccess) {
      return reply.code(403).send({ message: "Forbidden: Access denied" });
    }

    const startDate = dayjs()
      .subtract(parseInt(period), period.endsWith("d") ? "day" : "hour")
      .toDate();

    const topGoals = await prisma.event.groupBy({
      by: ["goalName"],
      where: {
        tenantId: tenantId,
        type: "goal",
        createdAt: { gte: startDate },
        goalName: { not: null },
      },
      _count: {
        goalName: true,
      },
      orderBy: {
        _count: {
          goalName: "desc",
        },
      },
      take: 10,
    });

    const goals = topGoals.map((g) => ({
      name: g.goalName,
      completions: g._count.goalName,
    }));

    return { goals };
  });

  app.get("/api/stats/locations", async (request, reply) => {
    const { tenantId, period } = statsQuerySchema.parse(request.query);
    const requestingUserId = request.userId!;
    const tenantAccess = await prisma.tenantUser.findUnique({
      where: { userId_tenantId: { userId: requestingUserId, tenantId } },
    });

    if (!tenantAccess) {
      return reply.code(403).send({ message: "Forbidden: Access denied" });
    }

    const startDate = dayjs()
      .subtract(parseInt(period), period.endsWith("d") ? "day" : "hour")
      .toDate();

    const topCountries = await prisma.event.groupBy({
      by: ["country"],
      where: {
        tenantId: tenantId,
        createdAt: { gte: startDate },
        country: { not: null },
      },
      _count: {
        country: true,
      },
      orderBy: {
        _count: {
          country: "desc",
        },
      },
      take: 20,
    });

    const locations = topCountries.map((c) => ({
      country: c.country,
      views: c._count.country,
    }));

    return { locations };
  });

  app.get("/api/stats/devices", async (request, reply) => {
    const { tenantId, period } = statsQuerySchema.parse(request.query);
    const requestingUserId = request.userId!;
    const tenantAccess = await prisma.tenantUser.findUnique({
      where: { userId_tenantId: { userId: requestingUserId, tenantId } },
    });

    if (!tenantAccess) {
      return reply.code(403).send({ message: "Forbidden: Access denied" });
    }

    const startDate = dayjs()
      .subtract(parseInt(period), period.endsWith("d") ? "day" : "hour")
      .toDate();

    const events = await prisma.event.findMany({
      where: { tenantId, createdAt: { gte: startDate }, screenWidth: { not: null } },
      select: { screenWidth: true },
    });

    let mobile = 0, tablet = 0, desktop = 0;
    for (const e of events) {
      const w = e.screenWidth!;
      if (w < 768) mobile++;
      else if (w <= 1024) tablet++;
      else desktop++;
    }

    return { devices: { mobile, tablet, desktop } };
  });

  app.get("/api/stats/engagement", async (request, reply) => {
    const { tenantId, period } = statsQuerySchema.parse(request.query);
    const requestingUserId = request.userId!;
    const tenantAccess = await prisma.tenantUser.findUnique({
      where: { userId_tenantId: { userId: requestingUserId, tenantId } },
    });

    if (!tenantAccess) {
      return reply.code(403).send({ message: "Forbidden: Access denied" });
    }

    const startDate = dayjs()
      .subtract(parseInt(period), period.endsWith("d") ? "day" : "hour")
      .toDate();

    const viewsPerVisitor = await prisma.event.groupBy({
      by: ["visitorId"],
      where: { tenantId, createdAt: { gte: startDate } },
      _count: { id: true },
      orderBy: { visitorId: "asc" },
    });

    const totalVisitors = viewsPerVisitor.length;
    const totalPages = viewsPerVisitor.reduce((sum, v) => sum + v._count.id, 0);
    const avgPagesPerSession = totalVisitors > 0 ? totalPages / totalVisitors : 0;

    const prevStartDate = dayjs(startDate)
      .subtract(parseInt(period), period.endsWith("d") ? "day" : "hour")
      .toDate();

    const prevVisitorIds = await prisma.event.findMany({
      where: { tenantId, createdAt: { gte: prevStartDate, lt: startDate } },
      select: { visitorId: true },
      distinct: ["visitorId"],
    });
    const prevVisitorSet = new Set(prevVisitorIds.map((v) => v.visitorId));

    const returning = viewsPerVisitor.filter((v) => prevVisitorSet.has(v.visitorId)).length;
    const newVisitors = totalVisitors - returning;

    return {
      avgPagesPerSession: parseFloat(avgPagesPerSession.toFixed(1)),
      newVisitors,
      returningVisitors: returning,
      totalVisitors,
    };
  });

  app.get("/api/stats/campaigns", async (request, reply) => {
    const { tenantId, period } = statsQuerySchema.parse(request.query);
    const requestingUserId = request.userId!;
    const tenantAccess = await prisma.tenantUser.findUnique({
      where: { userId_tenantId: { userId: requestingUserId, tenantId } },
    });

    if (!tenantAccess) {
      return reply.code(403).send({ message: "Forbidden: Access denied" });
    }

    const startDate = dayjs()
      .subtract(parseInt(period), period.endsWith("d") ? "day" : "hour")
      .toDate();

    const byMedium = await prisma.event.groupBy({
      by: ["utmMedium"],
      where: { tenantId, createdAt: { gte: startDate }, utmMedium: { not: null } },
      _count: { utmMedium: true },
      orderBy: { _count: { utmMedium: "desc" } },
      take: 10,
    });

    const byCampaign = await prisma.event.groupBy({
      by: ["utmCampaign"],
      where: { tenantId, createdAt: { gte: startDate }, utmCampaign: { not: null } },
      _count: { utmCampaign: true },
      orderBy: { _count: { utmCampaign: "desc" } },
      take: 10,
    });

    return {
      mediums: byMedium.map((m) => ({ medium: m.utmMedium, views: m._count.utmMedium })),
      campaigns: byCampaign.map((c) => ({ campaign: c.utmCampaign, views: c._count.utmCampaign })),
    };
  });

  app.get("/api/stats/cities", async (request, reply) => {
    const { tenantId, period } = statsQuerySchema.parse(request.query);
    const requestingUserId = request.userId!;
    const tenantAccess = await prisma.tenantUser.findUnique({
      where: { userId_tenantId: { userId: requestingUserId, tenantId } },
    });

    if (!tenantAccess) {
      return reply.code(403).send({ message: "Forbidden: Access denied" });
    }

    const startDate = dayjs()
      .subtract(parseInt(period), period.endsWith("d") ? "day" : "hour")
      .toDate();

    const topCities = await prisma.event.groupBy({
      by: ["city"],
      where: { tenantId, createdAt: { gte: startDate }, city: { not: null } },
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
      take: 20,
    });

    return {
      cities: topCities.map((c) => ({ city: c.city, views: c._count.city })),
    };
  });

  app.get("/api/stats/compare", async (request, reply) => {
    const { tenantId, period } = statsQuerySchema.parse(request.query);
    const requestingUserId = request.userId!;
    const tenantAccess = await prisma.tenantUser.findUnique({
      where: { userId_tenantId: { userId: requestingUserId, tenantId } },
    });

    if (!tenantAccess) {
      return reply.code(403).send({ message: "Forbidden: Access denied" });
    }

    const now = dayjs();
    const unit = period.endsWith("d") ? "day" : "hour";
    const amount = parseInt(period);
    const currentStart = now.subtract(amount, unit).toDate();
    const prevStart = now.subtract(amount * 2, unit).toDate();

    const [currentViews, prevViews] = await Promise.all([
      prisma.event.count({ where: { tenantId, createdAt: { gte: currentStart } } }),
      prisma.event.count({ where: { tenantId, createdAt: { gte: prevStart, lt: currentStart } } }),
    ]);

    const [currentVisitors, prevVisitors] = await Promise.all([
      prisma.event.findMany({ where: { tenantId, createdAt: { gte: currentStart } }, select: { visitorId: true }, distinct: ["visitorId"] }),
      prisma.event.findMany({ where: { tenantId, createdAt: { gte: prevStart, lt: currentStart } }, select: { visitorId: true }, distinct: ["visitorId"] }),
    ]);

    const pctChange = (curr: number, prev: number) =>
      prev > 0 ? parseFloat(((curr - prev) / prev * 100).toFixed(1)) : curr > 0 ? 100 : 0;

    return {
      pageViews: { current: currentViews, previous: prevViews, change: pctChange(currentViews, prevViews) },
      uniqueVisitors: { current: currentVisitors.length, previous: prevVisitors.length, change: pctChange(currentVisitors.length, prevVisitors.length) },
    };
  });
}
