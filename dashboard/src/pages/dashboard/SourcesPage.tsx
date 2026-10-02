import { Link2, Megaphone } from "lucide-react";
import { CampaignsSection } from "@/components/dashboard/CampaignsSection";
import { TableCard } from "@/components/dashboard/TableCard";
import { useStat } from "@/hooks/useStat";
import type {
  CampaignsResponse,
  ReferrersResponse,
  UtmSourcesResponse,
} from "@/lib/types/dashboard.types";

export default function SourcesPage() {
  const referrers = useStat<ReferrersResponse>("referrers");
  const sources = useStat<UtmSourcesResponse>("sources");
  const campaigns = useStat<CampaignsResponse>("campaigns");

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TableCard
          title="Top Referrers"
          icon={Link2}
          data={referrers.data?.referrers ?? []}
          labelKey="referrer"
          valueKey="views"
          valueLabel="Views"
        />
        <TableCard
          title="UTM Sources"
          icon={Megaphone}
          data={sources.data?.sources ?? []}
          labelKey="source"
          valueKey="views"
          valueLabel="Views"
        />
      </div>
      <CampaignsSection data={campaigns.data} />
    </>
  );
}
