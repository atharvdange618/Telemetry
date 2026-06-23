import AnalyticsChart from "@/components/AnalyticsChart";
import LocationMap from "@/components/LocationMap";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  const ChangeBadge = ({ change }: { change: number }) => (
    <span className={`text-xs font-medium ml-2 ${change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
      {change >= 0 ? "+" : ""}{change}%
    </span>
  );

  return (
    <div className="p-4 md:p-8 bg-background min-h-screen">
      <header className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl md:text-3xl font-bold truncate">
          {isLoadingTenants
            ? "Loading..."
            : selectedTenant?.name || "Dashboard"}
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-sm font-semibold">
                {isLoadingTenants
                  ? "Loading Sites..."
                  : selectedTenant?.name || "Select a Site"}
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Your Sites</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tenantsData?.tenants.map((tenant) => (
                <DropdownMenuItem
                  key={tenant.id}
                  onSelect={() => setSelectedTenantId(tenant.id)}
                >
                  {tenant.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate("/settings")}>
                Create New Site
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex rounded-md border border-border">
            {(["24h", "7d", "30d"] as const).map((p) => (
              <Button
                key={p}
                onClick={() => setPeriod(p)}
                variant={period === p ? "default" : "ghost"}
                size="sm"
                className="rounded-none first:rounded-l-md last:rounded-r-md"
              >
                {p}
              </Button>
            ))}
          </div>

          <Button asChild variant="outline" size="sm">
            <Link to="/settings">Settings</Link>
          </Button>

          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
            <AvatarFallback className="text-xs">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Logout</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to logout?</DialogTitle>
                <DialogDescription>
                  This action will log you out of your account. You will need to
                  log back in to access your dashboard.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleLogout} className="cursor-pointer">
                  Logout
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">Page Views{compareData && <ChangeBadge change={compareData.pageViews.change} />}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl md:text-4xl font-bold">
            {isLoadingSummary ? "..." : summary?.pageViews ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">Unique Visitors{compareData && <ChangeBadge change={compareData.uniqueVisitors.change} />}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl md:text-4xl font-bold">
            {isLoadingSummary ? "..." : summary?.uniqueVisitors ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pages / Session</span>
                <span className="font-semibold">{engagementData?.avgPagesPerSession ?? "..."}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New Visitors</span>
                <span className="font-semibold">{engagementData?.newVisitors ?? "..."}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Returning</span>
                <span className="font-semibold">{engagementData?.returningVisitors ?? "..."}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {viewsOverTime?.views && (
          <div className="lg:col-span-3">
            <AnalyticsChart
              data={viewsOverTime.views}
              title="Views Over Time"
            />
          </div>
        )}

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <LocationMap data={locationsData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
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
                  <TableRow>
                    <TableCell colSpan={2}>Loading...</TableCell>
                  </TableRow>
                ) : (
                  locationsData?.locations?.map((loc) => (
                    <TableRow key={loc.country}>
                      <TableCell>{loc.country}</TableCell>
                      <TableCell className="text-right">{loc.views}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
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
                  <TableRow>
                    <TableCell colSpan={2}>Loading...</TableCell>
                  </TableRow>
                ) : (
                  pages?.pages?.map((page) => (
                    <TableRow key={page.path}>
                      <TableCell>{page.path}</TableCell>
                      <TableCell className="text-right">{page.views}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Goal</TableHead>
                  <TableHead className="text-right">Completions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingGoals ? (
                  <TableRow>
                    <TableCell colSpan={2}>Loading...</TableCell>
                  </TableRow>
                ) : (
                  goalsData?.goals?.map((goal) => (
                    <TableRow key={goal.name}>
                      <TableCell>{goal.name}</TableCell>
                      <TableCell className="text-right">
                        {goal.completions}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Sources</CardTitle>
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
                  <TableRow>
                    <TableCell colSpan={2}>Loading...</TableCell>
                  </TableRow>
                ) : (
                  sourcesData?.sources?.map((source) => (
                    <TableRow key={source.source}>
                      <TableCell>{source.source}</TableCell>
                      <TableCell className="text-right">
                        {source.views}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
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
                  <TableRow>
                    <TableCell colSpan={2}>Loading...</TableCell>
                  </TableRow>
                ) : (
                  referrers?.referrers?.map((ref) => (
                    <TableRow key={ref.referrer}>
                      <TableCell>{ref.referrer}</TableCell>
                      <TableCell className="text-right">{ref.views}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {devicesData && (() => {
                const total = devicesData.devices.mobile + devicesData.devices.tablet + devicesData.devices.desktop;
                const items = [
                  { label: "Desktop", value: devicesData.devices.desktop, color: "bg-primary" },
                  { label: "Mobile", value: devicesData.devices.mobile, color: "bg-accent" },
                  { label: "Tablet", value: devicesData.devices.tablet, color: "bg-chart-3" },
                ];
                return items.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{total > 0 ? Math.round(item.value / total * 100) : 0}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${total > 0 ? item.value / total * 100 : 0}%` }} />
                    </div>
                  </div>
                ));
              })()}
              {!devicesData && <p className="text-sm text-muted-foreground">No data</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Cities</CardTitle>
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
                {citiesData?.cities?.length ? (
                  citiesData.cities.map((c) => (
                    <TableRow key={c.city}>
                      <TableCell>{c.city}</TableCell>
                      <TableCell className="text-right">{c.views}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2}>No data</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Mediums</CardTitle>
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
                      <TableCell>{m.medium}</TableCell>
                      <TableCell className="text-right">{m.views}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2}>No data</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Campaigns</CardTitle>
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
                      <TableCell>{c.campaign}</TableCell>
                      <TableCell className="text-right">{c.views}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2}>No data</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
