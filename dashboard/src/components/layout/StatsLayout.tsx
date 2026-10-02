import { useState } from "react";
import { Navigate, Outlet, useLocation, useMatch } from "react-router-dom";
import { useIsFetching } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { useDashboardParams } from "@/hooks/useDashboardParams";
import { useStat } from "@/hooks/useStat";
import { useTenants } from "@/hooks/useTenants";
import { API_URL } from "@/lib/api";
import { DASHBOARD_PAGES } from "@/lib/dashboard-pages";
import { toDateInputValue } from "@/lib/utils";
import type {
  BrowsersResponse,
  LanguagesResponse,
  LocationsResponse,
  OsResponse,
} from "@/lib/types/dashboard.types";
import { PageHeader } from "./PageHeader";
import { SetupWarning } from "./SetupWarning";
import { StatsToolbar } from "./StatsToolbar";

export function StatsLayout() {
  const params = useDashboardParams();
  const { siteId, search, customRange } = params;
  const location = useLocation();
  const statsMatch = useMatch("/dashboard/:siteId/:page");
  const { data: tenantsData } = useTenants();
  const [showFilters, setShowFilters] = useState(false);
  // Old data stays on screen while a new period or filter loads, so say so.
  const isUpdating = useIsFetching({ queryKey: ["stats"] }) > 0;

  const optionsOpts = { unfiltered: true, enabled: showFilters };
  const browserOptions = useStat<BrowsersResponse>("browsers", optionsOpts);
  const osOptions = useStat<OsResponse>("os", optionsOpts);
  const locationOptions = useStat<LocationsResponse>("locations", optionsOpts);
  const languageOptions = useStat<LanguagesResponse>("languages", optionsOpts);

  const site = tenantsData?.tenants.find((t) => t.id === siteId);
  // A deleted site, or one this account can't see.
  if (tenantsData && !site) return <Navigate to={{ pathname: "/dashboard", search: location.search }} replace />;

  const page = DASHBOARD_PAGES.find((p) => p.slug === statsMatch?.params.page);
  const hasActiveFilters = Object.values(search.segments).some(Boolean);

  const toggleCustomRange = () => {
    if (customRange) return params.clearCustomRange();
    // Start from the period on screen, so turning Custom on never shows a
    // blank range while the data still reflects the old period.
    const days = search.period === "24h" ? 1 : parseInt(search.period);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - days);
    params.setCustomRange(toDateInputValue(start), toDateInputValue(now));
  };

  const handleExport = (format: "csv" | "json") => {
    // Same range and filters as the dashboard, so the file matches the screen.
    const query = new URLSearchParams(params.statsQuery);
    query.set("format", format);
    window.open(`${API_URL}/api/export/events?${query.toString()}`, "_blank");
  };

  return (
    <>
      <SEO
        title={`${site?.name ?? "Dashboard"} ${page?.title ?? ""}`.trim()}
        description="View privacy-friendly website analytics."
        noindex={true}
      />
      <PageHeader title={page?.title ?? ""} status={isUpdating ? "Updating…" : undefined}>
        <StatsToolbar
          siteId={siteId}
          searchParams={params.searchParams}
          period={search.period}
          customRange={customRange}
          showFilters={showFilters}
          hasActiveFilters={hasActiveFilters}
          onSetPeriod={params.setPeriod}
          onToggleCustomRange={toggleCustomRange}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onExport={handleExport}
        />
      </PageHeader>

      <div className="space-y-6 p-4 md:p-6">
        <FiltersBar
          show={showFilters}
          customRange={customRange}
          startDate={search.startDate ?? ""}
          endDate={search.endDate ?? ""}
          segments={search.segments}
          browsersData={browserOptions.data}
          osData={osOptions.data}
          locationsData={locationOptions.data}
          languagesData={languageOptions.data}
          hasActiveFilters={hasActiveFilters}
          // A cleared date input sends "". Ignore it rather than dropping
          // out of the custom range mid-edit.
          onSetStartDate={(v) => v && params.setCustomRange(v, search.endDate ?? v)}
          onSetEndDate={(v) => v && params.setCustomRange(search.startDate ?? v, v)}
          onSetSegment={params.setSegment}
          onClearSegments={params.clearSegments}
        />
        {site && site.domains.length === 0 && <SetupWarning siteName={site.name} />}
        {/* Wait for the site list, so a stale or mistyped site id never fires stats requests. */}
        {site && <Outlet />}
      </div>
    </>
  );
}
