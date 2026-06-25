import AnalyticsChart from "@/components/AnalyticsChart";
import LocationMap from "@/components/LocationMap";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
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
  CampaignsResponse,
  CitiesResponse,
  CompareResponse,
  DevicesResponse,
  EngagementResponse,
  GoalsResponse,
  LocationsResponse,
  PagesResponse,
  ReferrersResponse,
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const fetchAPI = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const APP_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("24h");

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
    (t) => t.id === selectedTenantId
  );

  const endpoint = `${APP_URL}/api/stats`;
  const queryParams = `?tenantId=${selectedTenantId}&period=${period}`;

  const { data: summary, isLoading: isLoadingSummary } = useQuery<StatsSummary>(
    {
      queryKey: ["summary", selectedTenantId, period],
      queryFn: () => fetchAPI(`${endpoint}/summary${queryParams}`),
      enabled: !!selectedTenantId,
    }
  );

  const { data: pages, isLoading: isLoadingPages } = useQuery<PagesResponse>({
    queryKey: ["pages", selectedTenantId, period],
    queryFn: () => fetchAPI(`${endpoint}/pages${queryParams}`),
    enabled: !!selectedTenantId,
  });

  const { data: referrers, isLoading: isLoadingReferrers } =
    useQuery<ReferrersResponse>({
      queryKey: ["referrers", selectedTenantId, period],
      queryFn: () => fetchAPI(`${endpoint}/referrers${queryParams}`),
      enabled: !!selectedTenantId,
    });

  const { data: viewsOverTime } = useQuery<ViewsOverTimeResponse>({
    queryKey: ["viewsOverTime", selectedTenantId, period],
    queryFn: () => fetchAPI(`${endpoint}/views-over-time${queryParams}`),
    enabled: !!selectedTenantId,
  });

  const { data: sourcesData, isLoading: isLoadingSources } =
    useQuery<UtmSourcesResponse>({
      queryKey: ["sources", selectedTenantId, period],
      queryFn: () => fetchAPI(`${endpoint}/sources${queryParams}`),
      enabled: !!selectedTenantId,
    });

  const { data: goalsData, isLoading: isLoadingGoals } =
    useQuery<GoalsResponse>({
      queryKey: ["goals", selectedTenantId, period],
      queryFn: () => fetchAPI(`${endpoint}/goals${queryParams}`),
      enabled: !!selectedTenantId,
    });

  const { data: locationsData, isLoading: isLoadingLocations } =
    useQuery<LocationsResponse>({
      queryKey: ["locations", selectedTenantId, period],
      queryFn: () => fetchAPI(`${endpoint}/locations${queryParams}`),
      enabled: !!selectedTenantId,
    });

  const { data: devicesData } = useQuery<DevicesResponse>({
    queryKey: ["devices", selectedTenantId, period],
    queryFn: () => fetchAPI(`${endpoint}/devices${queryParams}`),
    enabled: !!selectedTenantId,
  });

  const { data: engagementData } = useQuery<EngagementResponse>({
    queryKey: ["engagement", selectedTenantId, period],
    queryFn: () => fetchAPI(`${endpoint}/engagement${queryParams}`),
    enabled: !!selectedTenantId,
  });

  const { data: campaignsData } = useQuery<CampaignsResponse>({
    queryKey: ["campaigns", selectedTenantId, period],
    queryFn: () => fetchAPI(`${endpoint}/campaigns${queryParams}`),
    enabled: !!selectedTenantId,
  });

  const { data: citiesData } = useQuery<CitiesResponse>({
    queryKey: ["cities", selectedTenantId, period],
    queryFn: () => fetchAPI(`${endpoint}/cities${queryParams}`),
    enabled: !!selectedTenantId,
  });

  const { data: compareData } = useQuery<CompareResponse>({
    queryKey: ["compare", selectedTenantId, period],
    queryFn: () => fetchAPI(`${endpoint}/compare${queryParams}`),
    enabled: !!selectedTenantId,
  });

  const handleLogout = async () => {
    try {
      const response = await fetch(`${APP_URL}/logout`, {
        credentials: "include",
      });
      if (response.ok) navigate("/", { replace: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    }
  };

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

  const tenantName = selectedTenant?.name || "Dashboard";

  return (
    <div className="p-4 md:p-8 bg-background min-h-screen">
      <SEO
        title={`${tenantName} Overview`}
        description="View real-time privacy-friendly website analytics, visitor statistics, device breakdown, goals, and referral data."
        noindex={true}
      />
      <header className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
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
            <p className="text-sm text-muted-foreground">
              Analytics overview
            </p>
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
                  className={tenant.id === selectedTenantId ? "bg-accent" : ""}
                >
                  {tenant.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Manage Sites
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex rounded-lg border border-border bg-muted/50 p-0.5">
            {(["24h", "7d", "30d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  period === p
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

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
                  <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

        {viewsOverTime?.views && (
          <AnalyticsChart
            data={viewsOverTime.views}
            title="Views Over Time"
          />
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingLocations ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="text-right"><div className="h-4 w-12 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : locationsData?.locations?.length ? (
                    locationsData.locations.map((loc) => (
                      <TableRow key={loc.country}>
                        <TableCell className="font-medium">{loc.country}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{loc.views.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                        No location data yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Path</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPages ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="text-right"><div className="h-4 w-12 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : pages?.pages?.length ? (
                    pages.pages.map((page) => (
                      <TableRow key={page.path}>
                        <TableCell className="font-mono text-sm">{page.path}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{page.views.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                        No page data yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Top Referrers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingReferrers ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-28 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="text-right"><div className="h-4 w-12 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : referrers?.referrers?.length ? (
                    referrers.referrers.map((ref) => (
                      <TableRow key={ref.referrer}>
                        <TableCell className="font-medium truncate max-w-[200px]">{ref.referrer}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{ref.views.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                        No referrer data yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {devicesData ? (() => {
                  const total = devicesData.devices.mobile + devicesData.devices.tablet + devicesData.devices.desktop;
                  const items = [
                    { label: "Desktop", value: devicesData.devices.desktop, color: "bg-primary" },
                    { label: "Mobile", value: devicesData.devices.mobile, color: "bg-accent" },
                    { label: "Tablet", value: devicesData.devices.tablet, color: "bg-chart-3" },
                  ];
                  return items.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium tabular-nums">{total > 0 ? Math.round(item.value / total * 100) : 0}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                          style={{ width: `${total > 0 ? item.value / total * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ));
                })() : (
                  <p className="text-sm text-muted-foreground text-center py-4">No device data yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Top Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Goal</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingGoals ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="text-right"><div className="h-4 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : goalsData?.goals?.length ? (
                    goalsData.goals.map((goal) => (
                      <TableRow key={goal.name}>
                        <TableCell className="font-medium">{goal.name}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{goal.completions}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                        No goals set
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Top Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSources ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="text-right"><div className="h-4 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : sourcesData?.sources?.length ? (
                    sourcesData.sources.map((source) => (
                      <TableRow key={source.source}>
                        <TableCell className="font-medium">{source.source}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{source.views.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                        No source data yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Top Cities</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingLocations ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="text-right"><div className="h-4 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : citiesData?.cities?.length ? (
                    citiesData.cities.map((c) => (
                      <TableRow key={c.city}>
                        <TableCell className="font-medium">{c.city}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{c.views.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                        No city data yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Top Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignsData?.campaigns?.length ? (
                    campaignsData.campaigns.map((c) => (
                      <TableRow key={c.campaign}>
                        <TableCell className="font-medium">{c.campaign}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{c.views.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                        No campaign data yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Top Mediums</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medium</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignsData?.mediums?.length ? (
                    campaignsData.mediums.map((m) => (
                      <TableRow key={m.medium}>
                        <TableCell className="font-medium">{m.medium}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{m.views.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                        No medium data yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
