import { prisma } from "./prisma";

export interface MetricsParams {
  tenantId: string;
  startDate: Date;
  endDate: Date;
  segments: Record<string, any>;
}

// Single source of truth for the mobile/tablet/desktop screenWidth cutoffs,
// so the device breakdown, the device segment filter, and any future
// consumer all agree on the same boundaries.
export const DEVICE_BREAKPOINTS = { mobileMax: 767, tabletMax: 1024 };

export function classifyDevice(
  screenWidth: number,
): "mobile" | "tablet" | "desktop" {
  if (screenWidth <= DEVICE_BREAKPOINTS.mobileMax) return "mobile";
  if (screenWidth <= DEVICE_BREAKPOINTS.tabletMax) return "tablet";
  return "desktop";
}

export function deviceSegmentFilter(device: string): Record<string, any> {
  if (device === "mobile") {
    return { screenWidth: { lte: DEVICE_BREAKPOINTS.mobileMax } };
  }
  if (device === "tablet") {
    return {
      screenWidth: {
        gt: DEVICE_BREAKPOINTS.mobileMax,
        lte: DEVICE_BREAKPOINTS.tabletMax,
      },
    };
  }
  return { screenWidth: { gt: DEVICE_BREAKPOINTS.tabletMax } };
}

export function calcPercentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

export function formatDuration(seconds: number): string {
  // Round first, so 59.6s becomes "1m 0s" instead of "60s".
  const total = Math.round(seconds);
  if (total < 60) return `${total}s`;
  if (total < 3600) return `${Math.floor(total / 60)}m ${total % 60}s`;
  return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m`;
}

export async function getSummary({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
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
  const bounceRate = uniqueVisitors > 0 ? (bounces / uniqueVisitors) * 100 : 0;

  return {
    pageViews,
    uniqueVisitors,
    bounceRate: parseFloat(bounceRate.toFixed(1)),
  };
}

export async function getTopPages({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
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
}

export async function getReferrers({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
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
}

export async function getViewsOverTime({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
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
      key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    }
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  const views = [...buckets.entries()]
    .map(([date, count]) => ({ date, views: count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { views };
}

export async function getSources({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
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
}

export async function getGoals({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
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
}

export async function getLocations({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
  const topCountries = await prisma.event.groupBy({
    by: ["country"],
    where: {
      tenantId,
      createdAt: { gte: startDate, lte: endDate },
      // Every event type stores location; count each visit once.
      type: "pageview",
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
}

export async function getCities({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
  const topCities = await prisma.event.groupBy({
    by: ["city"],
    where: {
      tenantId,
      createdAt: { gte: startDate, lte: endDate },
      type: "pageview",
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
}

export async function getDevices({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
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
    const category = classifyDevice(e.screenWidth!);
    if (category === "mobile") mobile++;
    else if (category === "tablet") tablet++;
    else desktop++;
  }

  return { devices: { mobile, tablet, desktop } };
}

export async function getEngagement({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
  const whereClause = {
    tenantId,
    createdAt: { gte: startDate, lte: endDate },
    type: "pageview",
    ...segments,
  };

  const events = await prisma.event.findMany({
    where: whereClause,
    select: { visitorId: true, sessionId: true },
  });

  // Sessions are grouped by visitorId + sessionId, not by visitorId alone,
  // so a returning visitor's separate sessions in this window aren't
  // folded into one inflated "session".
  const sessionsByVisitor = new Map<string, Set<string>>();
  for (const e of events) {
    if (!sessionsByVisitor.has(e.visitorId)) {
      sessionsByVisitor.set(e.visitorId, new Set());
    }
    if (e.sessionId) sessionsByVisitor.get(e.visitorId)!.add(e.sessionId);
  }

  const totalVisitors = sessionsByVisitor.size;
  const totalSessions = [...sessionsByVisitor.values()].reduce(
    (sum, s) => sum + Math.max(s.size, 1),
    0,
  );
  const avgPagesPerSession =
    totalSessions > 0 ? events.length / totalSessions : 0;

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

  const returning = [...sessionsByVisitor.keys()].filter((visitorId) =>
    prevVisitorSet.has(visitorId),
  ).length;
  const newVisitors = totalVisitors - returning;

  return {
    avgPagesPerSession: parseFloat(avgPagesPerSession.toFixed(1)),
    newVisitors,
    returningVisitors: returning,
    totalVisitors,
  };
}

export async function getCampaigns({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
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
}

export async function getCompare({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
  const durationMs = endDate.getTime() - startDate.getTime();
  const prevStart = new Date(startDate.getTime() - durationMs);
  const prevEnd = startDate;

  const baseWhere = { type: "pageview" as const, ...segments };

  const [currentViews, prevViews] = await Promise.all([
    prisma.event.count({
      where: { tenantId, createdAt: { gte: startDate, lte: endDate }, ...baseWhere },
    }),
    prisma.event.count({
      where: { tenantId, createdAt: { gte: prevStart, lt: prevEnd }, ...baseWhere },
    }),
  ]);

  const [currentVisitors, prevVisitors] = await Promise.all([
    prisma.event.findMany({
      where: { tenantId, createdAt: { gte: startDate, lte: endDate }, ...baseWhere },
      select: { visitorId: true },
      distinct: ["visitorId"],
    }),
    prisma.event.findMany({
      where: { tenantId, createdAt: { gte: prevStart, lt: prevEnd }, ...baseWhere },
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
}

export async function getBrowsers({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
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
        total > 0 ? parseFloat(((b._count.browser / total) * 100).toFixed(1)) : 0,
    })),
  };
}

export async function getOperatingSystems({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
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
      percentage: total > 0 ? parseFloat(((o._count.os / total) * 100).toFixed(1)) : 0,
    })),
  };
}

export async function getLanguages({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
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
        total > 0 ? parseFloat(((l._count.language / total) * 100).toFixed(1)) : 0,
    })),
  };
}

export async function getSessions({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
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
      totalDurationMs += s._max.createdAt.getTime() - s._min.createdAt.getTime();
    }
  }

  const avgDurationSec = totalSessions > 0 ? totalDurationMs / totalSessions / 1000 : 0;

  return {
    totalSessions,
    avgDurationSeconds: Math.round(avgDurationSec),
    avgDurationFormatted: formatDuration(avgDurationSec),
  };
}

export async function getScrollDepth({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
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
  const avg = depths.length > 0 ? depths.reduce((a, b) => a + b, 0) / depths.length : 0;

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
}

export async function getPerformance({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
  const perfEvents = await prisma.event.findMany({
    where: {
      tenantId,
      createdAt: { gte: startDate, lte: endDate },
      type: "performance",
      ...segments,
    },
    select: { lcp: true, inp: true, fid: true, cls: true, ttfb: true, fcp: true },
  });

  const extract = (field: "lcp" | "inp" | "fid" | "cls" | "ttfb" | "fcp") =>
    perfEvents.map((e) => e[field]).filter((v): v is number => v !== null);

  const lcp = extract("lcp"),
    inp = extract("inp"),
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
    inp: calcMetric(inp),
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
}

export async function getOutbound({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
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
}

export async function getInsights({
  tenantId,
  startDate,
  endDate,
  segments,
}: MetricsParams) {
  const durationMs = endDate.getTime() - startDate.getTime();
  const prevStart = new Date(startDate.getTime() - durationMs);
  const insights: { type: string; title: string; detail: string; value: number }[] = [];

  const [currViews, prevViews] = await Promise.all([
    prisma.event.count({
      where: { tenantId, createdAt: { gte: startDate, lte: endDate }, type: "pageview", ...segments },
    }),
    prisma.event.count({
      where: { tenantId, createdAt: { gte: prevStart, lt: startDate }, type: "pageview", ...segments },
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
      where: { tenantId, createdAt: { gte: startDate, lte: endDate }, type: "pageview", ...segments },
      select: { visitorId: true },
      distinct: ["visitorId"],
    }),
    prisma.event.findMany({
      where: { tenantId, createdAt: { gte: prevStart, lt: startDate }, type: "pageview", ...segments },
      select: { visitorId: true },
      distinct: ["visitorId"],
    }),
  ]);

  if (prevVisitors.length > 0) {
    const change =
      ((currVisitors.length - prevVisitors.length) / prevVisitors.length) * 100;
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
    where: { tenantId, createdAt: { gte: startDate, lte: endDate }, type: "pageview", ...segments },
    _count: { path: true },
    orderBy: { _count: { path: "desc" } },
    take: 20,
  });

  const prevPages = await prisma.event.groupBy({
    by: ["path"],
    where: { tenantId, createdAt: { gte: prevStart, lt: startDate }, type: "pageview", ...segments },
    _count: { path: true },
  });

  const prevPageMap = new Map(prevPages.map((p) => [p.path, p._count.path]));

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
      title: `Top referrer: ${topRef[0].referrer === "" ? "Direct" : topRef[0].referrer}`,
      detail: `${topRef[0]._count.referrer} visits from this source`,
      value: topRef[0]._count.referrer,
    });
  }

  return { insights };
}
