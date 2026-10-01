import { Navigate, useSearchParams } from "react-router-dom";
import { useTenants } from "@/hooks/useTenants";
import { dashboardPath, legacyDashboardTarget } from "@/lib/dashboard-params";

// /dashboard has no page of its own. Old ?tenant= links go to that site;
// otherwise the first site, or /sites for an account with none.
export function DashboardIndexRedirect() {
  const [searchParams] = useSearchParams();
  const { data, isError } = useTenants();
  const legacy = legacyDashboardTarget(searchParams);

  if (legacy.siteId) {
    return <Navigate to={dashboardPath(legacy.siteId, "overview", legacy.search)} replace />;
  }
  if (isError) {
    return (
      <p className="p-8 text-sm text-muted-foreground">
        Couldn't load your sites. Refresh to try again.
      </p>
    );
  }
  if (!data) return null;

  const first = data.tenants[0];
  if (!first) return <Navigate to="/sites" replace />;
  return <Navigate to={dashboardPath(first.id, "overview", legacy.search)} replace />;
}
