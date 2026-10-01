import { describe, expect, it } from "vitest";
import {
  dashboardPath,
  isCustomRange,
  legacyDashboardTarget,
  parseDashboardSearch,
  toDateRange,
  toStatsQuery,
  updateSearch,
} from "./dashboard-params";

const parse = (qs: string) => parseDashboardSearch(new URLSearchParams(qs));

describe("parseDashboardSearch", () => {
  it("defaults to 24h with no range or filters", () => {
    expect(parse("")).toEqual({
      period: "24h",
      startDate: null,
      endDate: null,
      segments: {},
    });
  });

  it("reads a preset period and filters", () => {
    expect(parse("period=7d&browser=Chrome&device=mobile")).toEqual({
      period: "7d",
      startDate: null,
      endDate: null,
      segments: { browser: "Chrome", device: "mobile" },
    });
  });

  it("falls back on unknown period and device values", () => {
    const s = parse("period=banana&device=phone");
    expect(s.period).toBe("24h");
    expect(s.segments).toEqual({});
  });

  it("drops dates that aren't YYYY-MM-DD", () => {
    const s = parse("startDate=yesterday&endDate=2026-10-01");
    expect(s.startDate).toBeNull();
    expect(s.endDate).toBe("2026-10-01");
  });

  it("drops dates that don't exist on the calendar", () => {
    const s = parse("startDate=2026-13-45&endDate=2026-02-31");
    expect(s.startDate).toBeNull();
    expect(s.endDate).toBeNull();
    expect(isCustomRange(s)).toBe(false);
  });
});

describe("isCustomRange and toDateRange", () => {
  it("needs both dates for a custom range", () => {
    const s = parse("period=7d&startDate=2026-09-01");
    expect(isCustomRange(s)).toBe(false);
    expect(toDateRange(s)).toEqual({ period: "7d" });
  });

  it("lets a custom range win over the period and cover whole local days", () => {
    const s = parse("period=7d&startDate=2026-09-01&endDate=2026-09-30");
    expect(isCustomRange(s)).toBe(true);
    expect(toDateRange(s)).toEqual({
      startDate: new Date(2026, 8, 1).toISOString(),
      endDate: new Date(2026, 8, 30, 23, 59, 59).toISOString(),
    });
  });
});

describe("toStatsQuery", () => {
  it("includes site, timezone, range and only the filters that are set", () => {
    const q = toStatsQuery("site1", parse("period=30d&os=iOS"), "Asia/Kolkata");
    expect(Object.fromEntries(new URLSearchParams(q))).toEqual({
      tenantId: "site1",
      tz: "Asia/Kolkata",
      period: "30d",
      os: "iOS",
    });
  });

  it("leaves filters out when asked, for the filter dropdown options", () => {
    const q = toStatsQuery("site1", parse("os=iOS"), "UTC", false);
    expect(new URLSearchParams(q).has("os")).toBe(false);
  });
});

describe("updateSearch", () => {
  it("sets keys, deletes null keys and leaves the input alone", () => {
    const input = new URLSearchParams("period=7d&browser=Chrome");
    const next = updateSearch(input, { period: "30d", browser: null });
    expect(next.toString()).toBe("period=30d");
    expect(input.toString()).toBe("period=7d&browser=Chrome");
  });
});

describe("legacyDashboardTarget", () => {
  it("moves tenant out of the query and keeps everything else", () => {
    const target = legacyDashboardTarget(
      new URLSearchParams(
        "tenant=abc&period=7d&startDate=2026-09-01&endDate=2026-09-30&browser=Chrome",
      ),
    );
    expect(target).toEqual({
      siteId: "abc",
      search: "period=7d&startDate=2026-09-01&endDate=2026-09-30&browser=Chrome",
    });
  });

  it("returns no site when the link has no tenant", () => {
    expect(legacyDashboardTarget(new URLSearchParams("period=7d"))).toEqual({
      siteId: null,
      search: "period=7d",
    });
  });
});

describe("dashboardPath", () => {
  it("keeps the query string, with or without its leading ?", () => {
    expect(dashboardPath("abc", "content", "?period=7d")).toBe(
      "/dashboard/abc/content?period=7d",
    );
    expect(dashboardPath("abc", "content", "period=7d")).toBe(
      "/dashboard/abc/content?period=7d",
    );
  });

  it("adds no ? when there is no query", () => {
    expect(dashboardPath("abc", "overview")).toBe("/dashboard/abc/overview");
    expect(dashboardPath("abc", "overview", "?")).toBe("/dashboard/abc/overview");
  });
});
