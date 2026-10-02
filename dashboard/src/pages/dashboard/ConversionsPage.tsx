import { Target } from "lucide-react";
import { CohortSection } from "@/components/dashboard/CohortSection";
import { FunnelSection } from "@/components/dashboard/FunnelSection";
import { TableCard } from "@/components/dashboard/TableCard";
import { useDashboardParams } from "@/hooks/useDashboardParams";
import { useStat } from "@/hooks/useStat";
import type { GoalsResponse } from "@/lib/types/dashboard.types";

export default function ConversionsPage() {
  const { siteId, range, statsQuery } = useDashboardParams();
  const goals = useStat<GoalsResponse>("goals");

  return (
    <>
      <TableCard
        title="Top Goals"
        icon={Target}
        data={goals.data?.goals ?? []}
        labelKey="name"
        valueKey="completions"
        valueLabel="Count"
      />
      {/* Keyed by site so switching sites clears the previous funnel. */}
      <FunnelSection key={siteId} tenantId={siteId} range={range} />
      <CohortSection queryParams={statsQuery} enabled={siteId !== ""} />
    </>
  );
}
