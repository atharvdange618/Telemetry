import { PerformanceSection } from "@/components/dashboard/PerformanceSection";
import { useStat } from "@/hooks/useStat";
import type { PerformanceResponse } from "@/lib/types/dashboard.types";

export default function PerformancePage() {
  const perf = useStat<PerformanceResponse>("performance");
  return <PerformanceSection data={perf.data} />;
}
