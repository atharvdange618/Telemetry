import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  SEGMENT_KEYS,
  isCustomRange,
  parseDashboardSearch,
  toDateRange,
  toStatsQuery,
  updateSearch,
  type Period,
  type Segments,
} from "@/lib/dashboard-params";

// So chart days start at the viewer's midnight, not the server's.
const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

// The URL is the only state: the site from the path, everything else from
// the query string. Setters replace the history entry, so filter tweaks
// don't fill the back button.
export function useDashboardParams() {
  const { siteId = "" } = useParams<{ siteId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = useMemo(() => parseDashboardSearch(searchParams), [searchParams]);
  const range = useMemo(() => toDateRange(search), [search]);
  const statsQuery = useMemo(
    () => toStatsQuery(siteId, search, TIME_ZONE),
    [siteId, search],
  );
  const optionsQuery = useMemo(
    () => toStatsQuery(siteId, search, TIME_ZONE, false),
    [siteId, search],
  );

  const patch = (changes: Record<string, string | null>) =>
    setSearchParams((prev) => updateSearch(prev, changes), { replace: true });

  return {
    siteId,
    searchParams,
    search,
    range,
    customRange: isCustomRange(search),
    statsQuery,
    optionsQuery,
    setPeriod: (period: Period) =>
      patch({ period, startDate: null, endDate: null }),
    setCustomRange: (startDate: string, endDate: string) =>
      patch({ startDate, endDate }),
    clearCustomRange: () => patch({ startDate: null, endDate: null }),
    setSegment: (key: keyof Segments, value: string) =>
      patch({ [key]: value || null }),
    clearSegments: () =>
      patch(Object.fromEntries(SEGMENT_KEYS.map((key) => [key, null]))),
  };
}
