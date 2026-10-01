import { useQuery } from "@tanstack/react-query";
import { API_URL, fetchJSON } from "@/lib/api";
import type { TenantsResponse } from "@/lib/types/dashboard.types";

// Same key the Sites page uses, so both share one cached list.
export function useTenants() {
  return useQuery<TenantsResponse>({
    queryKey: ["tenants"],
    queryFn: () => fetchJSON<TenantsResponse>(`${API_URL}/api/tenants`),
  });
}
