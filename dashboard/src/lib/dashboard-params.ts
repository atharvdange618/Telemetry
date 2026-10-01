import type { DateRange } from "@/lib/types/dashboard.types";

export const PERIODS = ["24h", "7d", "30d", "90d"] as const;
export type Period = (typeof PERIODS)[number];

export const DEVICES = ["mobile", "tablet", "desktop"] as const;
export type Device = (typeof DEVICES)[number];

export interface Segments {
  browser?: string;
  os?: string;
  country?: string;
  language?: string;
  device?: Device;
}

export const SEGMENT_KEYS = [
  "browser",
  "os",
  "country",
  "language",
  "device",
] as const satisfies readonly (keyof Segments)[];

// Everything about the dashboard view that lives in the query string.
export interface DashboardSearch {
  period: Period;
  // YYYY-MM-DD. A custom range needs both; the period stays so turning
  // Custom off returns to it.
  startDate: string | null;
  endDate: string | null;
  segments: Segments;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isOneOf<T extends string>(list: readonly T[], value: string | null): value is T {
  return value !== null && (list as readonly string[]).includes(value);
}

// Bad or stale values fall back to defaults, so a hand-edited URL never
// sends something the API rejects.
export function parseDashboardSearch(search: URLSearchParams): DashboardSearch {
  const startDate = search.get("startDate");
  const endDate = search.get("endDate");
  const period = search.get("period");
  const device = search.get("device");

  const segments: Segments = {};
  for (const key of ["browser", "os", "country", "language"] as const) {
    const value = search.get(key);
    if (value) segments[key] = value;
  }
  if (isOneOf(DEVICES, device)) segments.device = device;

  return {
    period: isOneOf(PERIODS, period) ? period : "24h",
    startDate: startDate && DATE_PATTERN.test(startDate) ? startDate : null,
    endDate: endDate && DATE_PATTERN.test(endDate) ? endDate : null,
    segments,
  };
}

export function isCustomRange(s: DashboardSearch): boolean {
  return s.startDate !== null && s.endDate !== null;
}

// A custom range runs from local midnight on the start day to the last
// second of the end day, so it covers whole days where the viewer is.
export function toDateRange(s: DashboardSearch): DateRange {
  if (s.startDate && s.endDate) {
    return {
      startDate: new Date(`${s.startDate}T00:00:00`).toISOString(),
      endDate: new Date(`${s.endDate}T23:59:59`).toISOString(),
    };
  }
  return { period: s.period };
}

// The query string for /api/stats/*. withSegments=false is for the filter
// dropdowns, so picking one browser doesn't hide every other browser.
export function toStatsQuery(
  siteId: string,
  s: DashboardSearch,
  timeZone: string,
  withSegments = true,
): string {
  const params = new URLSearchParams({ tenantId: siteId, tz: timeZone });
  for (const [key, value] of Object.entries(toDateRange(s))) {
    if (value) params.set(key, value);
  }
  if (withSegments) {
    for (const key of SEGMENT_KEYS) {
      const value = s.segments[key];
      if (value) params.set(key, value);
    }
  }
  return params.toString();
}

// Returns a copy with each key set, or deleted when its value is null or "".
export function updateSearch(
  search: URLSearchParams,
  patch: Record<string, string | null>,
): URLSearchParams {
  const next = new URLSearchParams(search);
  for (const [key, value] of Object.entries(patch)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  return next;
}

// Links from before the sidebar put the site in ?tenant=.
export function legacyDashboardTarget(search: URLSearchParams): {
  siteId: string | null;
  search: string;
} {
  const rest = new URLSearchParams(search);
  const siteId = rest.get("tenant");
  rest.delete("tenant");
  return { siteId, search: rest.toString() };
}

export function dashboardPath(siteId: string, page: string, search = ""): string {
  const query = search.replace(/^\?/, "");
  return `/dashboard/${encodeURIComponent(siteId)}/${page}${query ? `?${query}` : ""}`;
}
