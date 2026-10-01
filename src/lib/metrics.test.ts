import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "./prisma";
import {
  calcPercentile,
  classifyDevice,
  deviceSegmentFilter,
  formatDuration,
  getCities,
  getEngagement,
  getLocations,
  getSummary,
  type MetricsParams,
} from "./metrics";

vi.mock("./prisma", () => ({
  prisma: {
    event: { count: vi.fn(), groupBy: vi.fn(), findMany: vi.fn() },
  },
}));

const params: MetricsParams = {
  tenantId: "t1",
  startDate: new Date("2026-09-01T00:00:00Z"),
  endDate: new Date("2026-09-08T00:00:00Z"),
  segments: {},
};

// Prisma's overloaded query types don't fit mocked return values; these
// helpers cast once so each test only states the rows it cares about.
const groupByReturns = (...results: unknown[]) => {
  for (const rows of results) vi.mocked(prisma.event.groupBy).mockResolvedValueOnce(rows as never);
};
const findManyReturns = (...results: unknown[]) => {
  for (const rows of results) vi.mocked(prisma.event.findMany).mockResolvedValueOnce(rows as never);
};

beforeEach(() => {
  vi.mocked(prisma.event.count).mockReset();
  vi.mocked(prisma.event.groupBy).mockReset();
  vi.mocked(prisma.event.findMany).mockReset();
});

describe("classifyDevice", () => {
  it("splits on the mobile and tablet breakpoints", () => {
    expect(classifyDevice(767)).toBe("mobile");
    expect(classifyDevice(768)).toBe("tablet");
    expect(classifyDevice(1024)).toBe("tablet");
    expect(classifyDevice(1025)).toBe("desktop");
  });
});

describe("deviceSegmentFilter", () => {
  // The filter runs in SQL and classifyDevice runs in JS. If they disagree,
  // filtering by "tablet" shows different numbers than the device chart.
  const matches = (width: number, filter: Record<string, { gt?: number; lte?: number }>) => {
    const { gt, lte } = filter.screenWidth;
    return (gt === undefined || width > gt) && (lte === undefined || width <= lte);
  };

  it("agrees with classifyDevice at every breakpoint edge", () => {
    for (const width of [320, 767, 768, 1024, 1025, 2560]) {
      const device = classifyDevice(width);
      expect(matches(width, deviceSegmentFilter(device))).toBe(true);
      for (const other of ["mobile", "tablet", "desktop"].filter((d) => d !== device)) {
        expect(matches(width, deviceSegmentFilter(other))).toBe(false);
      }
    }
  });
});

describe("calcPercentile", () => {
  it("returns 0 for no data", () => {
    expect(calcPercentile([], 75)).toBe(0);
  });

  it("uses the nearest-rank method on unsorted input", () => {
    expect(calcPercentile([40, 10, 30, 20], 50)).toBe(20);
    expect(calcPercentile([40, 10, 30, 20], 75)).toBe(30);
    expect(calcPercentile([40, 10, 30, 20], 100)).toBe(40);
  });

  it("doesn't reorder the caller's array", () => {
    const values = [3, 1, 2];
    calcPercentile(values, 50);
    expect(values).toEqual([3, 1, 2]);
  });
});

describe("formatDuration", () => {
  it("formats seconds, minutes and hours", () => {
    expect(formatDuration(42)).toBe("42s");
    expect(formatDuration(90)).toBe("1m 30s");
    expect(formatDuration(3700)).toBe("1h 1m");
  });

  it("never shows 60 in the seconds place", () => {
    expect(formatDuration(59.6)).toBe("1m 0s");
    expect(formatDuration(119.6)).toBe("2m 0s");
  });
});

describe("getSummary", () => {
  it("counts a visitor with one pageview as a bounce", async () => {
    vi.mocked(prisma.event.count).mockResolvedValue(5);
    groupByReturns([
      { visitorId: "a", _count: { id: 1 } },
      { visitorId: "b", _count: { id: 4 } },
    ]);

    expect(await getSummary(params)).toEqual({ pageViews: 5, uniqueVisitors: 2, bounceRate: 50 });
  });

  it("reports a 0% bounce rate, not NaN, with no visitors", async () => {
    vi.mocked(prisma.event.count).mockResolvedValue(0);
    groupByReturns([]);

    expect((await getSummary(params)).bounceRate).toBe(0);
  });
});

describe("getEngagement", () => {
  it("counts each visitor's separate sessions and spots returning visitors", async () => {
    findManyReturns(
      [
        { visitorId: "a", sessionId: "a1" },
        { visitorId: "a", sessionId: "a1" },
        { visitorId: "a", sessionId: "a2" },
        { visitorId: "b", sessionId: "b1" },
      ],
      [{ visitorId: "a" }],
    );

    expect(await getEngagement(params)).toEqual({
      avgPagesPerSession: 1.3, // 4 pageviews over 3 sessions
      newVisitors: 1,
      returningVisitors: 1,
      totalVisitors: 2,
    });
  });
});

describe("location breakdowns", () => {
  // Every event type stores country and city, so without a pageview filter
  // one visit with scroll, performance and goal events counts several times.
  it.each([
    ["getLocations", getLocations],
    ["getCities", getCities],
  ])("%s counts pageviews only", async (_name, fn) => {
    groupByReturns([]);
    await fn(params);

    const [args] = vi.mocked(prisma.event.groupBy).mock.calls[0] as [{ where: { type?: string } }];
    expect(args.where.type).toBe("pageview");
  });
});
