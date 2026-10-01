import { BarChart3, Eye, FileText, Link2, Timer, Users } from "lucide-react";
import AnalyticsChart from "@/components/AnalyticsChart";
import { InsightCards } from "@/components/dashboard/InsightCards";
import { StatCard } from "@/components/dashboard/StatCard";
import { TableCard } from "@/components/dashboard/TableCard";
import { useDashboardParams } from "@/hooks/useDashboardParams";
import { useStat } from "@/hooks/useStat";
import { dashboardPath } from "@/lib/dashboard-params";
import type {
  CompareResponse,
  InsightsResponse,
  PagesResponse,
  ReferrersResponse,
  SessionsResponse,
  StatsSummary,
  ViewsOverTimeResponse,
} from "@/lib/types/dashboard.types";

export default function OverviewPage() {
  const { siteId, searchParams } = useDashboardParams();
  const summary = useStat<StatsSummary>("summary");
  const compare = useStat<CompareResponse>("compare");
  const sessions = useStat<SessionsResponse>("sessions");
  const views = useStat<ViewsOverTimeResponse>("views-over-time");
  const insights = useStat<InsightsResponse>("insights");
  const pages = useStat<PagesResponse>("pages");
  const referrers = useStat<ReferrersResponse>("referrers");
  const search = searchParams.toString();

  return (
    <>
      <InsightCards data={insights.data} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Unique Visitors"
          value={summary.data?.uniqueVisitors ?? 0}
          icon={Users}
          change={compare.data?.uniqueVisitors?.change}
          isLoading={summary.isLoading}
          tooltip="Number of individual people who visited your site. Each person is counted only once, no matter how many pages they viewed."
        />
        <StatCard
          title="Page Views"
          value={summary.data?.pageViews ?? 0}
          icon={Eye}
          change={compare.data?.pageViews?.change}
          isLoading={summary.isLoading}
          tooltip="Total number of pages viewed. If one person views the same page 3 times, that counts as 3 page views."
        />
        <StatCard
          title="Bounce Rate"
          value={summary.data?.bounceRate != null ? `${summary.data.bounceRate}%` : "—"}
          icon={BarChart3}
          isLoading={summary.isLoading}
          tooltip="Percentage of visitors who left after viewing only one page, without clicking anything else. Lower is generally better."
        />
        <StatCard
          title="Avg Session"
          value={sessions.data?.avgDurationFormatted ?? "—"}
          icon={Timer}
          isLoading={!sessions.data}
          tooltip="How long, on average, people spend on your site per visit. Longer usually means they find your content useful."
        />
      </div>

      {views.data?.views && (
        <AnalyticsChart
          data={views.data.views}
          title="Views Over Time"
          tooltip="Shows how many page views your site received over the selected time period. The line goes up when traffic increases and down when it decreases."
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TableCard
          title="Top Pages"
          icon={FileText}
          data={pages.data?.pages ?? []}
          labelKey="path"
          valueKey="views"
          valueLabel="Views"
          limit={5}
          moreHref={dashboardPath(siteId, "content", search)}
        />
        <TableCard
          title="Top Referrers"
          icon={Link2}
          data={referrers.data?.referrers ?? []}
          labelKey="referrer"
          valueKey="views"
          valueLabel="Views"
          limit={5}
          moreHref={dashboardPath(siteId, "sources", search)}
        />
      </div>
    </>
  );
}
