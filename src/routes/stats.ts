import { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma";
import { authHook } from "../hooks/auth";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);
import {
  statsQuerySchema,
  funnelBodySchema,
  exportQuerySchema,
} from "../lib/schemas";
import * as metrics from "../lib/metrics";
import { MetricsParams } from "../lib/metrics";

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

function segmentFilters(query: Record<string, any>) {
  const where: Record<string, any> = {};
  if (query.browser) where.browser = query.browser;
  if (query.os) where.os = query.os;
  if (query.country) where.country = query.country;
  if (query.language) where.language = query.language;
  if (query.referrer) where.referrer = query.referrer;
  if (query.utmSource) where.utmSource = query.utmSource;
  if (query.device)
    Object.assign(where, metrics.deviceSegmentFilter(query.device));
  return where;
}

async function checkAccess(userId: string, tenantId: string) {
  const access = await prisma.tenantUser.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
  });
  return !!access;
}

function parseQuery(request: any): MetricsParams {
  const parsed = statsQuerySchema.parse(request.query);
  const { startDate, endDate } = resolveDateRange(parsed);
  const segments = segmentFilters(parsed as Record<string, any>);
  return {
    tenantId: parsed.tenantId,
    startDate,
    endDate,
    segments,
    timeZone: parsed.tz,
  };
}

export async function statsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authHook);

  function metricRoute(
    path: string,
    handler: (params: MetricsParams) => Promise<unknown>,
    label: string,
  ) {
    app.get(path, async (request, reply) => {
      try {
        const params = parseQuery(request);
        if (!(await checkAccess(request.userId!, params.tenantId))) {
          return reply.code(403).send({ message: "Forbidden" });
        }
        return await handler(params);
      } catch (error) {
        if (error instanceof ZodError) {
          return reply
            .code(400)
            .send({ message: "Invalid query parameters", errors: error.issues });
        }
        app.log.error(error, `Failed to fetch ${label} stats`);
        return reply.code(500).send({ message: "Internal server error" });
      }
    });
  }

  metricRoute("/api/stats/summary", metrics.getSummary, "summary");
  metricRoute("/api/stats/pages", metrics.getTopPages, "pages");
  metricRoute("/api/stats/referrers", metrics.getReferrers, "referrers");
  metricRoute(
    "/api/stats/views-over-time",
    metrics.getViewsOverTime,
    "views-over-time",
  );
  metricRoute("/api/stats/sources", metrics.getSources, "sources");
  metricRoute("/api/stats/goals", metrics.getGoals, "goals");
  metricRoute("/api/stats/locations", metrics.getLocations, "locations");
  metricRoute("/api/stats/devices", metrics.getDevices, "devices");
  metricRoute("/api/stats/engagement", metrics.getEngagement, "engagement");
  metricRoute("/api/stats/campaigns", metrics.getCampaigns, "campaigns");
  metricRoute("/api/stats/cities", metrics.getCities, "cities");
  metricRoute("/api/stats/compare", metrics.getCompare, "compare");
  metricRoute("/api/stats/browsers", metrics.getBrowsers, "browsers");
  metricRoute("/api/stats/os", metrics.getOperatingSystems, "OS");
  metricRoute("/api/stats/languages", metrics.getLanguages, "language");
  metricRoute("/api/stats/sessions", metrics.getSessions, "session");
  metricRoute(
    "/api/stats/scroll-depth",
    metrics.getScrollDepth,
    "scroll depth",
  );
  metricRoute("/api/stats/performance", metrics.getPerformance, "performance");
  metricRoute("/api/stats/outbound", metrics.getOutbound, "outbound");
  metricRoute("/api/stats/insights", metrics.getInsights, "insights");

  // --- Funnel Analysis ---
  app.post("/api/stats/funnels", async (request, reply) => {
    try {
      const body = funnelBodySchema.parse(request.body);
      if (!(await checkAccess(request.userId!, body.tenantId))) {
        return reply.code(403).send({ message: "Forbidden" });
      }

      const { startDate, endDate } = resolveDateRange(body);
      const steps = body.steps;

      // A visitor only counts toward step i if they also completed step i-1
      // at or before that visit, so conversion reflects the actual sequence
      // instead of independent per-path visitor counts.
      const funnelSteps: { step: string; visitors: number }[] = [];
      let allowedVisitors: Set<string> | null = null;
      let stepTimeByVisitor = new Map<string, Date>();

      for (let i = 0; i < steps.length; i++) {
        const where: Record<string, any> = {
          tenantId: body.tenantId,
          createdAt: { gte: startDate, lte: endDate },
          type: "pageview",
          path: steps[i],
        };
        if (allowedVisitors) {
          where.visitorId = { in: [...allowedVisitors] };
        }

        const events = await prisma.event.findMany({
          where,
          select: { visitorId: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        });

        const firstQualifyingTouch = new Map<string, Date>();
        for (const e of events) {
          if (firstQualifyingTouch.has(e.visitorId)) continue;
          if (i === 0) {
            firstQualifyingTouch.set(e.visitorId, e.createdAt);
          } else {
            const prevTime = stepTimeByVisitor.get(e.visitorId);
            if (prevTime && e.createdAt >= prevTime) {
              firstQualifyingTouch.set(e.visitorId, e.createdAt);
            }
          }
        }

        allowedVisitors = new Set(firstQualifyingTouch.keys());
        stepTimeByVisitor = firstQualifyingTouch;
        funnelSteps.push({ step: steps[i], visitors: allowedVisitors.size });
      }

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

      const cohorts = new Map<
        string,
        { visitors: Set<string>; weekStart: Date }
      >();
      for (const [visitorId, firstVisit] of visitorFirstVisit) {
        const weekKey =
          dayjs(firstVisit).isoWeekYear() +
          "-W" +
          String(dayjs(firstVisit).isoWeek()).padStart(2, "0");
        const weekStart = dayjs(firstVisit).startOf("isoWeek").toDate();
        if (!cohorts.has(weekKey))
          cohorts.set(weekKey, { visitors: new Set(), weekStart });
        cohorts.get(weekKey)!.visitors.add(visitorId);
      }

      const cohortResult = [];
      const sortedCohorts = [...cohorts.entries()].sort((a, b) =>
        a[0].localeCompare(b[0]),
      );

      for (const [
        cohortWeek,
        { visitors: visitorIds, weekStart },
      ] of sortedCohorts.slice(-8)) {
        const cohortData: Record<string, number> = { cohort: visitorIds.size };

        for (let w = 0; w <= 7; w++) {
          const wStart = dayjs(weekStart).add(w, "week").toDate();
          const wEnd = dayjs(wStart).add(1, "week").toDate();

          if (wEnd > endDate) break;

          const returningVisitors = await prisma.event.findMany({
            where: {
              tenantId,
              createdAt: { gte: wStart, lt: wEnd },
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
          ...segmentFilters(parsed as Record<string, any>),
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
          "inp",
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
            // ISO 8601 so spreadsheets parse it as a date and it sorts as text.
            const str = val instanceof Date ? val.toISOString() : String(val);
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
