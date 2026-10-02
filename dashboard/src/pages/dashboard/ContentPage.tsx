import { ExternalLink, FileText, Scroll, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { TableCard } from "@/components/dashboard/TableCard";
import { useStat } from "@/hooks/useStat";
import { toOutboundRows } from "@/lib/utils";
import type {
  EngagementResponse,
  OutboundResponse,
  PagesResponse,
  ScrollDepthResponse,
} from "@/lib/types/dashboard.types";

export default function ContentPage() {
  const pages = useStat<PagesResponse>("pages");
  const engagement = useStat<EngagementResponse>("engagement");
  const scroll = useStat<ScrollDepthResponse>("scroll-depth");
  const outbound = useStat<OutboundResponse>("outbound");

  const dist = scroll.data?.distribution;
  const scrollRows = dist
    ? [
        { depth: "25%", visits: dist.at25 },
        { depth: "50%", visits: dist.at50 },
        { depth: "75%", visits: dist.at75 },
        { depth: "100%", visits: dist.at100 },
      ]
    : [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Pages / Session"
          value={engagement.data?.avgPagesPerSession ?? "—"}
          icon={TrendingUp}
          isLoading={engagement.isPending}
          tooltip="Average number of pages a person looks at during a single visit. Higher usually means your content is engaging."
        />
        <StatCard
          title="Avg Scroll"
          value={scroll.data?.avgScrollDepth ? `${scroll.data.avgScrollDepth}%` : "—"}
          icon={Scroll}
          isLoading={scroll.isPending}
          tooltip="How far down the page people typically scroll. 100% means they reached the bottom."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TableCard
          className="lg:col-span-2"
          title="Top Pages"
          icon={FileText}
          data={pages.data?.pages ?? []}
          labelKey="path"
          valueKey="views"
          valueLabel="Views"
        />
        <TableCard
          title="Scroll Depth"
          icon={Scroll}
          data={scrollRows}
          labelKey="depth"
          valueKey="visits"
          valueLabel="Visits"
        />
      </div>

      <TableCard
        title="Outbound Links"
        icon={ExternalLink}
        data={toOutboundRows(outbound.data)}
        labelKey="url"
        valueKey="clicks"
        valueLabel="Clicks"
      />
    </>
  );
}
