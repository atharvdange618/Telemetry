import AnalyticsChart from "@/components/AnalyticsChart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  GoalsResponse,
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

const fetchAPI = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("24h");

  const { data: tenantsData, isLoading: isLoadingTenants } =
    useQuery<TenantsResponse>({
      queryKey: ["tenants"],
      queryFn: () => fetchAPI("http://localhost:3000/api/tenants"),
    });

  useEffect(() => {
    if (tenantsData?.tenants?.[0] && !selectedTenantId) {
      setSelectedTenantId(tenantsData.tenants[0].id);
    }
  }, [selectedTenantId, tenantsData]);

  const selectedTenant = tenantsData?.tenants.find(
    (t) => t.id === selectedTenantId
  );

  const endpoint = `http://localhost:3000/api/stats`;
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

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {isLoadingTenants
            ? "Loading..."
            : selectedTenant?.name || "Dashboard"}
        </h1>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="text-xl font-bold p-6">
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

        <div className="flex items-center gap-4">
          <div>
            <Button
              onClick={() => setPeriod("24h")}
              variant={period === "24h" ? "default" : "outline"}
            >
              24h
            </Button>
            <Button
              onClick={() => setPeriod("7d")}
              variant={period === "7d" ? "default" : "outline"}
            >
              7d
            </Button>
            <Button
              onClick={() => setPeriod("30d")}
              variant={period === "30d" ? "default" : "outline"}
            >
              30d
            </Button>
          </div>
          <Button asChild variant="outline">
            <Link to="/settings">Settings</Link>
          </Button>
          <Avatar>
            <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            onClick={async () => {
              await fetch("http://localhost:3000/logout", {
                credentials: "include",
              });
              navigate("/login", { replace: true });
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Page Views</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold">
            {isLoadingSummary ? "..." : summary?.pageViews ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unique Visitors</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold">
            {isLoadingSummary ? "..." : summary?.uniqueVisitors ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold">
            {isLoadingSummary ? "..." : `${summary?.bounceRate ?? 0}%`}
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

        {/* Top Pages Table */}
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

        {/* Top Goals Table */}
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

        {/* Top Sources Table */}
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

        {/* Top Referrers Table */}
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
      </main>
    </div>
  );
}
