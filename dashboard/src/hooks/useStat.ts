import { useQuery } from "@tanstack/react-query";
import { API_URL, fetchJSON } from "@/lib/api";
import { useDashboardParams } from "./useDashboardParams";

interface UseStatOptions {
  /** Ignore the active filters. For the filter dropdown options. */
  unfiltered?: boolean;
  enabled?: boolean;
}

// One /api/stats/<name> request for the current site, range and filters.
// With no filter active, unfiltered and filtered calls share a cache key,
// so the filter dropdowns cost no extra requests.
export function useStat<T>(name: string, { unfiltered = false, enabled = true }: UseStatOptions = {}) {
  const { siteId, search, statsQuery, optionsQuery } = useDashboardParams();
  const segments = unfiltered ? {} : search.segments;

  return useQuery<T>({
    queryKey: ["stats", siteId, search.period, search.startDate, search.endDate, segments, name],
    queryFn: () =>
      fetchJSON<T>(`${API_URL}/api/stats/${name}?${unfiltered ? optionsQuery : statsQuery}`),
    enabled: enabled && siteId !== "",
  });
}
