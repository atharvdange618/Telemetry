import AnalyticsChart from "@/components/AnalyticsChart";
import { SEO } from "@/components/SEO";
import type {
  BrowsersResponse,
  CampaignsResponse,
  CitiesResponse,
  CompareResponse,
  DevicesResponse,
  EngagementResponse,
  GoalsResponse,
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
  UtmSourcesResponse,
  ViewsOverTimeResponse,
  SharedViewResponse,
} from "@/lib/types/dashboard.types";
import { useQuery } from "@tanstack/react-query";
import { Eye, Users, TrendingUp, BarChart3, Timer, Scroll, AlertCircle } from "lucide-react";
import { useSearchParams, useParams } from "react-router-dom";
import { useMemo } from "react";

import { StatCard } from "@/components/dashboard/StatCard";
import { LocationSection } from "@/components/dashboard/LocationSection";
import { PagesReferrersSection } from "@/components/dashboard/PagesReferrersSection";
import { TechSection } from "@/components/dashboard/TechSection";
import { GoalsSection } from "@/components/dashboard/GoalsSection";
import { PerformanceSection } from "@/components/dashboard/PerformanceSection";
import { CampaignsSection } from "@/components/dashboard/CampaignsSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const fetchAPI = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

export default function SharedDashboardPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const APP_URL = import.meta.env.VITE_API_URL;

  const { data: viewData, isLoading: isLoadingView, error: viewError } =
    useQuery<SharedViewResponse>({
      queryKey: ["shared", token],
      queryFn: () => fetchAPI(`${APP_URL}/api/shared/${token}`),
      enabled: !!token,
    });

  const endpoint = `${APP_URL}/api/shared/${token}/stats`;
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    const period = searchParams.get("period") || viewData?.config?.period || "24h";
    const startDate = searchParams.get("startDate") || viewData?.config?.startDate;
    const endDate = searchParams.get("endDate") || viewData?.config?.endDate;

    if (startDate && endDate) {
      params.set("startDate", startDate);
      params.set("endDate", endDate);
    } else {
      params.set("period", period);
    }

    const segments = viewData?.config?.segments || {};
    const browser = searchParams.get("browser") || segments.browser;
    const os = searchParams.get("os") || segments.os;
    const country = searchParams.get("country") || segments.country;
    const language = searchParams.get("language") || segments.language;
    const device = searchParams.get("device") || segments.device;

    if (browser) params.set("browser", browser);
    if (os) params.set("os", os);
    if (country) params.set("country", country);
    if (language) params.set("language", language);
    if (device) params.set("device", device);

    return params.toString();
  }, [searchParams, viewData]);

  const enabled = !!token && !!viewData;
  const queryKey = ["shared", token, queryParams];

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

  const { data: compareData } = useQuery<CompareResponse>({
    queryKey: [...queryKey, "compare"],
    queryFn: () => fetchAPI(`${endpoint}/compare?${queryParams}`),
    enabled,
  });

  const { data: goalsData } = useQuery<GoalsResponse>({
    queryKey: [...queryKey, "goals"],
    queryFn: () => fetchAPI(`${endpoint}/goals?${queryParams}`),
    enabled,
  });

  const { data: sourcesData } = useQuery<UtmSourcesResponse>({
    queryKey: [...queryKey, "sources"],
    queryFn: () => fetchAPI(`${endpoint}/sources?${queryParams}`),
    enabled,
  });

  const { data: citiesData } = useQuery<CitiesResponse>({
    queryKey: [...queryKey, "cities"],
    queryFn: () => fetchAPI(`${endpoint}/cities?${queryParams}`),
    enabled,
  });

  if (viewError) {
    return (
      <div className="p-4 md:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Link not found</h1>
          <p className="text-muted-foreground">
            This share link may have been revoked or is invalid.
          </p>
          <Button asChild>
            <Link to="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    );
  }

  const label = viewData?.label || "Shared Dashboard";

  return (
    <div className="p-4 md:p-8 min-h-screen relative">
      <div className="noise" />
      <SEO title={`${label} - Shared`} description="Shared analytics dashboard view" noindex={true} />

      <header className="mb-8">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-2xl bg-primary/8 border border-primary/10">
            <img src="/logo.svg" alt="Telemetry" className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight truncate font-heading">
              {isLoadingView ? "Loading..." : label}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Shared analytics view</p>
          </div>
        </div>
      </header>

      <main className="space-y-6">
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
            value={scrollData?.avgScrollDepth ? `${scrollData.avgScrollDepth}%` : "\u2014"}
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
