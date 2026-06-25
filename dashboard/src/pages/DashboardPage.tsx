import AnalyticsChart from "@/components/AnalyticsChart";
import LocationMap from "@/components/LocationMap";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  ChevronsUpDown,
  Settings,
  LogOut,
  BarChart3,
  Users,
  Eye,
  TrendingUp,
  Globe,
  FileText,
  Target,
  Link2,
  Monitor,
  MapPin,
  Megaphone,
  Download,
  Filter,
  Lightbulb,
  Timer,
  Scroll,
  Gauge,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

  const { data: summary, isLoading: isLoadingSummary } = useQuery<StatsSummary>(
    {
      queryKey: [...queryKey, "summary"],
      queryFn: () => fetchAPI(`${endpoint}/summary?${queryParams}`),
      enabled,
    },
  );

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

  const ChangeIndicator = ({ change }: { change: number }) => (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
        change >= 0
          ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
    </span>
  );

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    isLoading,
  }: {
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    change?: number;
    isLoading?: boolean;
  }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl md:text-3xl font-bold tracking-tight">
            {isLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              value
            )}
          </div>
          {change !== undefined && <ChangeIndicator change={change} />}
        </div>
      </CardContent>
    </Card>
  );

  const SimpleTable = ({
    data,
    labelKey,
    valueKey,
    valueLabel,
  }: {
    data: object[];
    labelKey: string;
    valueKey: string;
    valueLabel: string;
  }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {labelKey.charAt(0).toUpperCase() + labelKey.slice(1)}
          </TableHead>
          <TableHead className="text-right">{valueLabel}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.length ? (
          data.map((item, i) => {
            const row = item as Record<
              string,
              string | number | boolean | null | undefined
            >;
            const val = row[valueKey];
            return (
              <TableRow key={i}>
                <TableCell className="font-medium">{row[labelKey]}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {typeof val === "number" ? val.toLocaleString() : val}
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell
              colSpan={2}
              className="text-center text-muted-foreground py-4"
            >
              No data yet
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const tenantName = selectedTenant?.name || "Dashboard";
  const hasActiveFilters = Object.values(segments).some(Boolean);

  return (
    <div className="p-4 md:p-8 bg-background min-h-screen">
      <SEO
        title={`${tenantName} Overview`}
        description="View real-time privacy-friendly website analytics."
        noindex={true}
      />

      <header className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <img src="/logo.svg" alt="Telemetry Logo" className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">
              {isLoadingTenants
                ? "Loading..."
                : selectedTenant?.name || "Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">Analytics overview</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {isLoadingTenants
                  ? "Loading Sites..."
                  : selectedTenant?.name || "Select a Site"}
                <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Your Sites</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tenantsData?.tenants.map((tenant) => (
                <DropdownMenuItem
                  key={tenant.id}
                  onSelect={() => setSelectedTenantId(tenant.id)}
                  className={
                    tenant.id === selectedTenantId
                      ? "bg-accent"
                      : "cursor-pointer"
                  }
                >
                  {tenant.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate("/settings")}>
                <Settings className="h-4 w-4 mr-2" /> Manage Sites
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex rounded-lg border border-border bg-muted/50 p-0.5">
            {(["24h", "7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p);
                  setCustomRange(false);
                }}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  period === p && !customRange
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            variant={customRange ? "default" : "outline"}
            size="sm"
            onClick={() => setCustomRange(!customRange)}
          >
            Custom
          </Button>

          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1"
          >
            <Filter className="h-3.5 w-3.5" />
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => handleExport("csv")}>
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleExport("json")}>
                Export JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DarkModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-border transition-all">
                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate("/settings")}>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {customRange && (
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg border border-border bg-muted/30">
          <span className="text-sm text-muted-foreground">From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1 text-sm rounded-md border border-border bg-background"
          />
          <span className="text-sm text-muted-foreground">To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1 text-sm rounded-md border border-border bg-background"
          />
        </div>
      )}

      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg border border-border bg-muted/30">
          <span className="text-sm font-medium text-muted-foreground">
            Filters:
          </span>
          <select
            value={segments.browser || ""}
            onChange={(e) => setSegment("browser", e.target.value)}
            className="px-2 py-1 text-sm rounded-md border border-border bg-background"
          >
            <option value="">All Browsers</option>
            {browsersData?.browsers?.map((b) => (
              <option key={b.browser} value={b.browser}>
                {b.browser}
              </option>
            ))}
          </select>
          <select
            value={segments.os || ""}
            onChange={(e) => setSegment("os", e.target.value)}
            className="px-2 py-1 text-sm rounded-md border border-border bg-background"
          >
            <option value="">All OS</option>
            {osData?.operatingSystems?.map((o) => (
              <option key={o.os} value={o.os}>
                {o.os}
              </option>
            ))}
          </select>
          <select
            value={segments.country || ""}
            onChange={(e) => setSegment("country", e.target.value)}
            className="px-2 py-1 text-sm rounded-md border border-border bg-background"
          >
            <option value="">All Countries</option>
            {locationsData?.locations?.map((l) => (
              <option key={l.country} value={l.country}>
                {l.country}
              </option>
            ))}
          </select>
          <select
            value={segments.language || ""}
            onChange={(e) => setSegment("language", e.target.value)}
            className="px-2 py-1 text-sm rounded-md border border-border bg-background"
          >
            <option value="">All Languages</option>
            {languagesData?.languages?.map((l) => (
              <option key={l.language} value={l.language}>
                {l.language}
              </option>
            ))}
          </select>
          <select
            value={segments.device || ""}
            onChange={(e) => setSegment("device", e.target.value)}
            className="px-2 py-1 text-sm rounded-md border border-border bg-background"
          >
            <option value="">All Devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSegments}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      )}

      <main className="space-y-6">
        {insightsData?.insights?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {insightsData.insights.map((insight, i) => (
              <Card key={i} className="border-l-4 border-l-primary">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{insight.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {insight.detail}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

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
            value={engagementData?.avgPagesPerSession ?? "—"}
            icon={TrendingUp}
            isLoading={!engagementData}
          />
          <StatCard
            title="Bounce Rate"
            value={summary?.bounceRate != null ? `${summary.bounceRate}%` : "—"}
            icon={BarChart3}
            isLoading={isLoadingSummary}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Sessions"
            value={sessionsData?.totalSessions ?? "—"}
            icon={Timer}
            isLoading={!sessionsData}
          />
          <StatCard
            title="Avg Session"
            value={sessionsData?.avgDurationFormatted ?? "—"}
            icon={Timer}
            isLoading={!sessionsData}
          />
          <StatCard
            title="Avg Scroll"
            value={
              scrollData?.avgScrollDepth ? `${scrollData.avgScrollDepth}%` : "—"
            }
            icon={Scroll}
            isLoading={!scrollData}
          />
          <StatCard
            title="Scroll (100%)"
            value={scrollData?.distribution?.at100 ?? "—"}
            icon={Scroll}
            isLoading={!scrollData}
          />
        </div>

        {viewsOverTime?.views && (
          <AnalyticsChart data={viewsOverTime.views} title="Views Over Time" />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <LocationMap data={locationsData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Top Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleTable
                data={locationsData?.locations || []}
                labelKey="country"
                valueKey="views"
                valueLabel="Views"
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleTable
                data={pages?.pages || []}
                labelKey="path"
                valueKey="views"
                valueLabel="Views"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Top Referrers</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleTable
                data={referrers?.referrers || []}
                labelKey="referrer"
                valueKey="views"
                valueLabel="Views"
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Browsers</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleTable
                data={browsersData?.browsers || []}
                labelKey="browser"
                valueKey="percentage"
                valueLabel="%"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Operating Systems</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleTable
                data={osData?.operatingSystems || []}
                labelKey="os"
                valueKey="percentage"
                valueLabel="%"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleTable
                data={languagesData?.languages || []}
                labelKey="language"
                valueKey="percentage"
                valueLabel="%"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {devicesData ? (
                  (() => {
                    const total =
                      devicesData.devices.mobile +
                      devicesData.devices.tablet +
                      devicesData.devices.desktop;
                    return [
                      {
                        label: "Desktop",
                        value: devicesData.devices.desktop,
                        color: "bg-primary",
                      },
                      {
                        label: "Mobile",
                        value: devicesData.devices.mobile,
                        color: "bg-accent",
                      },
                      {
                        label: "Tablet",
                        value: devicesData.devices.tablet,
                        color: "bg-chart-3",
                      },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-muted-foreground">
                            {item.label}
                          </span>
                          <span className="font-medium tabular-nums">
                            {total > 0
                              ? Math.round((item.value / total) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                            style={{
                              width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ));
                  })()
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No device data yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Top Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleTable
                data={goalsData?.goals || []}
                labelKey="name"
                valueKey="completions"
                valueLabel="Count"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Top Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleTable
                data={sourcesData?.sources || []}
                labelKey="source"
                valueKey="views"
                valueLabel="Views"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Top Cities</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleTable
                data={citiesData?.cities || []}
                labelKey="city"
                valueKey="views"
                valueLabel="Views"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Outbound Links</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleTable
                data={(outboundData?.outboundLinks || []).map((o) => ({
                  url: new URL(o.url).hostname,
                  clicks: o.clicks,
                }))}
                labelKey="url"
                valueKey="clicks"
                valueLabel="Clicks"
              />
            </CardContent>
          </Card>
        </div>

        {perfData && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">
                Performance (Core Web Vitals)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  {
                    label: "LCP",
                    data: perfData.lcp,
                    unit: "ms",
                    good: 2500,
                    poor: 4000,
                  },
                  {
                    label: "FID/INP",
                    data: perfData.fid,
                    unit: "ms",
                    good: 100,
                    poor: 300,
                  },
                  {
                    label: "CLS",
                    data: perfData.cls,
                    unit: "",
                    good: 0.1,
                    poor: 0.25,
                  },
                  {
                    label: "TTFB",
                    data: perfData.ttfb,
                    unit: "ms",
                    good: 800,
                    poor: 1800,
                  },
                  {
                    label: "FCP",
                    data: perfData.fcp,
                    unit: "ms",
                    good: 1800,
                    poor: 3000,
                  },
                ].map((m) => {
                  const val = m.data?.p75 || 0;
                  const status =
                    val <= m.good
                      ? "good"
                      : val <= m.poor
                        ? "needs-improvement"
                        : "poor";
                  const color =
                    status === "good"
                      ? "text-green-600"
                      : status === "needs-improvement"
                        ? "text-yellow-600"
                        : "text-red-600";
                  return (
                    <div key={m.label} className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        {m.label}
                      </p>
                      <p className={`text-2xl font-bold ${color}`}>
                        {m.label === "CLS" ? val.toFixed(3) : Math.round(val)}
                        {m.unit}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        p75 · {m.data?.count || 0} samples
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Top Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleTable
                data={campaignsData?.campaigns || []}
                labelKey="campaign"
                valueKey="views"
                valueLabel="Views"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Top Mediums</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleTable
                data={campaignsData?.mediums || []}
                labelKey="medium"
                valueKey="views"
                valueLabel="Views"
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
