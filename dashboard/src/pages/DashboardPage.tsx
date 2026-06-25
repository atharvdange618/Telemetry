import AnalyticsChart from "@/components/AnalyticsChart";
import { SEO } from "@/components/SEO";
import { useAuthStore } from "@/lib/state/auth";
import type {
  BrowsersResponse,
  CampaignsResponse,
  CitiesResponse,
  CompareResponse,
  DevicesResponse,
  EngagementResponse,
  GoalsResponse,
  InsightsResponse,
  LanguagesResponse,
  LocationsResponse,
  OsResponse,
  OutboundResponse,
  PagesResponse,
  PerformanceResponse,
  ReferrersResponse,
  ScrollDepthResponse,
  SessionsResponse,
  StatsSummary,
  TenantsResponse,
  UtmSourcesResponse,
  ViewsOverTimeResponse,
} from "@/lib/types/dashboard.types";
import { useQuery } from "@tanstack/react-query";
import { Eye, Users, TrendingUp, BarChart3, Timer, Scroll } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { StatCard } from "@/components/dashboard/StatCard";
import { InsightCards } from "@/components/dashboard/InsightCards";
import { LocationSection } from "@/components/dashboard/LocationSection";
import { PagesReferrersSection } from "@/components/dashboard/PagesReferrersSection";
import { TechSection } from "@/components/dashboard/TechSection";
import { GoalsSection } from "@/components/dashboard/GoalsSection";
import { PerformanceSection } from "@/components/dashboard/PerformanceSection";
import { CampaignsSection } from "@/components/dashboard/CampaignsSection";

const fetchAPI = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

type Segments = {
  browser?: string;
  os?: string;
  country?: string;
  language?: string;
  device?: "mobile" | "tablet" | "desktop";
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const APP_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("24h");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [segments, setSegments] = useState<Segments>({});
  const [showFilters, setShowFilters] = useState(false);
  const [customRange, setCustomRange] = useState(false);

  const { data: tenantsData, isLoading: isLoadingTenants } =
    useQuery<TenantsResponse>({
      queryKey: ["tenants"],
      queryFn: () => fetchAPI(`${APP_URL}/api/tenants`),
    });

  useEffect(() => {
    if (tenantsData?.tenants?.[0] && !selectedTenantId) {
      setSelectedTenantId(tenantsData.tenants[0].id);
    }
  }, [selectedTenantId, tenantsData]);

  const selectedTenant = tenantsData?.tenants.find(
    (t) => t.id === selectedTenantId,
  );

  const endpoint = `${APP_URL}/api/stats`;
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("tenantId", selectedTenantId || "");
    if (customRange && startDate && endDate) {
      params.set("startDate", new Date(startDate).toISOString());
      params.set("endDate", new Date(endDate + "T23:59:59").toISOString());
    } else {
      params.set("period", period);
    }
    if (segments.browser) params.set("browser", segments.browser);
    if (segments.os) params.set("os", segments.os);
    if (segments.country) params.set("country", segments.country);
    if (segments.language) params.set("language", segments.language);
    if (segments.device) params.set("device", segments.device);
    return params.toString();
  }, [selectedTenantId, period, startDate, endDate, customRange, segments]);

  const queryKey = [
    "stats",
    selectedTenantId,
    period,
    startDate,
    endDate,
    customRange,
    segments,
  ];
  const enabled = !!selectedTenantId;

  const { data: summary, isLoading: isLoadingSummary } = useQuery<StatsSummary>({
    queryKey: [...queryKey, "summary"],
    queryFn: () => fetchAPI(`${endpoint}/summary?${queryParams}`),
    enabled,
  });

  const { data: pages } = useQuery<PagesResponse>({
    queryKey: [...queryKey, "pages"],
    queryFn: () => fetchAPI(`${endpoint}/pages?${queryParams}`),
    enabled,
  });

  const { data: referrers } = useQuery<ReferrersResponse>({
    queryKey: [...queryKey, "referrers"],
    queryFn: () => fetchAPI(`${endpoint}/referrers?${queryParams}`),
    enabled,
  });

  const { data: viewsOverTime } = useQuery<ViewsOverTimeResponse>({
    queryKey: [...queryKey, "viewsOverTime"],
    queryFn: () => fetchAPI(`${endpoint}/views-over-time?${queryParams}`),
    enabled,
  });

  const { data: sourcesData } = useQuery<UtmSourcesResponse>({
    queryKey: [...queryKey, "sources"],
    queryFn: () => fetchAPI(`${endpoint}/sources?${queryParams}`),
    enabled,
  });

  const { data: goalsData } = useQuery<GoalsResponse>({
    queryKey: [...queryKey, "goals"],
    queryFn: () => fetchAPI(`${endpoint}/goals?${queryParams}`),
    enabled,
  });

  const { data: locationsData } = useQuery<LocationsResponse>({
    queryKey: [...queryKey, "locations"],
    queryFn: () => fetchAPI(`${endpoint}/locations?${queryParams}`),
    enabled,
  });

  const { data: devicesData } = useQuery<DevicesResponse>({
    queryKey: [...queryKey, "devices"],
    queryFn: () => fetchAPI(`${endpoint}/devices?${queryParams}`),
    enabled,
  });

  const { data: engagementData } = useQuery<EngagementResponse>({
    queryKey: [...queryKey, "engagement"],
    queryFn: () => fetchAPI(`${endpoint}/engagement?${queryParams}`),
    enabled,
  });

  const { data: campaignsData } = useQuery<CampaignsResponse>({
    queryKey: [...queryKey, "campaigns"],
    queryFn: () => fetchAPI(`${endpoint}/campaigns?${queryParams}`),
    enabled,
  });

  const { data: citiesData } = useQuery<CitiesResponse>({
    queryKey: [...queryKey, "cities"],
    queryFn: () => fetchAPI(`${endpoint}/cities?${queryParams}`),
    enabled,
  });

  const { data: compareData } = useQuery<CompareResponse>({
    queryKey: [...queryKey, "compare"],
    queryFn: () => fetchAPI(`${endpoint}/compare?${queryParams}`),
    enabled,
  });

  const { data: browsersData } = useQuery<BrowsersResponse>({
    queryKey: [...queryKey, "browsers"],
    queryFn: () => fetchAPI(`${endpoint}/browsers?${queryParams}`),
    enabled,
  });

  const { data: osData } = useQuery<OsResponse>({
    queryKey: [...queryKey, "os"],
    queryFn: () => fetchAPI(`${endpoint}/os?${queryParams}`),
    enabled,
  });

  const { data: languagesData } = useQuery<LanguagesResponse>({
    queryKey: [...queryKey, "languages"],
    queryFn: () => fetchAPI(`${endpoint}/languages?${queryParams}`),
    enabled,
  });

  const { data: sessionsData } = useQuery<SessionsResponse>({
    queryKey: [...queryKey, "sessions"],
    queryFn: () => fetchAPI(`${endpoint}/sessions?${queryParams}`),
    enabled,
  });

  const { data: scrollData } = useQuery<ScrollDepthResponse>({
    queryKey: [...queryKey, "scrollDepth"],
    queryFn: () => fetchAPI(`${endpoint}/scroll-depth?${queryParams}`),
    enabled,
  });

  const { data: perfData } = useQuery<PerformanceResponse>({
    queryKey: [...queryKey, "performance"],
    queryFn: () => fetchAPI(`${endpoint}/performance?${queryParams}`),
    enabled,
  });

  const { data: outboundData } = useQuery<OutboundResponse>({
    queryKey: [...queryKey, "outbound"],
    queryFn: () => fetchAPI(`${endpoint}/outbound?${queryParams}`),
    enabled,
  });

  const { data: insightsData } = useQuery<InsightsResponse>({
    queryKey: [...queryKey, "insights"],
    queryFn: () => fetchAPI(`${endpoint}/insights?${queryParams}`),
    enabled,
  });

  const handleLogout = async () => {
    try {
      const response = await fetch(`${APP_URL}/logout`, {
        credentials: "include",
      });
      if (response.ok) navigate("/", { replace: true });
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
      else toast.error("An unknown error occurred.");
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    const params = new URLSearchParams();
    params.set("tenantId", selectedTenantId || "");
    params.set("format", format);
    if (startDate) params.set("startDate", new Date(startDate).toISOString());
    if (endDate)
      params.set("endDate", new Date(endDate + "T23:59:59").toISOString());
    window.open(`${APP_URL}/api/export/events?${params.toString()}`, "_blank");
  };

  const setSegment = (key: keyof Segments, value: string) => {
    setSegments((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const clearSegments = () => setSegments({});

  const tenantName = selectedTenant?.name || "Dashboard";
  const hasActiveFilters = Object.values(segments).some(Boolean);

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <SEO
        title={`${tenantName} Overview`}
        description="View real-time privacy-friendly website analytics."
        noindex={true}
      />

      <DashboardHeader
        user={user}
        tenantsData={tenantsData}
        isLoadingTenants={isLoadingTenants}
        selectedTenantId={selectedTenantId}
        selectedTenant={selectedTenant}
        period={period}
        customRange={customRange}
        showFilters={showFilters}
        hasActiveFilters={hasActiveFilters}
        onSelectTenant={setSelectedTenantId}
        onSetPeriod={(p) => { setPeriod(p); setCustomRange(false); }}
        onToggleCustomRange={() => setCustomRange(!customRange)}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onExport={handleExport}
        onNavigate={(path) => navigate(path)}
        onLogout={handleLogout}
      />

      <FiltersBar
        show={showFilters}
        customRange={customRange}
        startDate={startDate}
        endDate={endDate}
        segments={segments}
        browsersData={browsersData}
        osData={osData}
        locationsData={locationsData}
        languagesData={languagesData}
        hasActiveFilters={hasActiveFilters}
        onSetStartDate={setStartDate}
        onSetEndDate={setEndDate}
        onSetSegment={setSegment}
        onClearSegments={clearSegments}
      />

      <main className="space-y-6">
        <InsightCards data={insightsData} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Page Views"
            value={summary?.pageViews ?? 0}
            icon={Eye}
            change={compareData?.pageViews?.change}
            isLoading={isLoadingSummary}
          />
          <StatCard
            title="Unique Visitors"
            value={summary?.uniqueVisitors ?? 0}
            icon={Users}
            change={compareData?.uniqueVisitors?.change}
            isLoading={isLoadingSummary}
          />
          <StatCard
            title="Pages / Session"
            value={engagementData?.avgPagesPerSession ?? "\u2014"}
            icon={TrendingUp}
            isLoading={!engagementData}
          />
          <StatCard
            title="Bounce Rate"
            value={summary?.bounceRate != null ? `${summary.bounceRate}%` : "\u2014"}
            icon={BarChart3}
            isLoading={isLoadingSummary}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Sessions"
            value={sessionsData?.totalSessions ?? "\u2014"}
            icon={Timer}
            isLoading={!sessionsData}
          />
          <StatCard
            title="Avg Session"
            value={sessionsData?.avgDurationFormatted ?? "\u2014"}
            icon={Timer}
            isLoading={!sessionsData}
          />
          <StatCard
            title="Avg Scroll"
            value={
              scrollData?.avgScrollDepth ? `${scrollData.avgScrollDepth}%` : "\u2014"
            }
            icon={Scroll}
            isLoading={!scrollData}
          />
          <StatCard
            title="Scroll (100%)"
            value={scrollData?.distribution?.at100 ?? "\u2014"}
            icon={Scroll}
            isLoading={!scrollData}
          />
        </div>

        {viewsOverTime?.views && (
          <AnalyticsChart data={viewsOverTime.views} title="Views Over Time" />
        )}

        <LocationSection data={locationsData} />
        <PagesReferrersSection pages={pages} referrers={referrers} />
        <TechSection
          browsers={browsersData}
          os={osData}
          languages={languagesData}
          devices={devicesData}
        />
        <GoalsSection
          goals={goalsData}
          sources={sourcesData}
          cities={citiesData}
          outbound={outboundData}
        />
        <PerformanceSection data={perfData} />
        <CampaignsSection data={campaignsData} />
      </main>
    </div>
  );
}
