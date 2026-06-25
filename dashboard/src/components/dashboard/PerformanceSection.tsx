import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";
import type { PerformanceResponse } from "@/lib/types/dashboard.types";

export function PerformanceSection({
  data,
}: {
  data: PerformanceResponse | undefined;
}) {
  if (!data) return null;

  const metrics = [
    { label: "LCP", data: data.lcp, unit: "ms", good: 2500, poor: 4000 },
    { label: "FID/INP", data: data.fid, unit: "ms", good: 100, poor: 300 },
    { label: "CLS", data: data.cls, unit: "", good: 0.1, poor: 0.25 },
    { label: "TTFB", data: data.ttfb, unit: "ms", good: 800, poor: 1800 },
    { label: "FCP", data: data.fcp, unit: "ms", good: 1800, poor: 3000 },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Gauge className="h-4 w-4 text-muted-foreground/60" />
        <CardTitle className="text-base">Performance (Core Web Vitals)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {metrics.map((m) => {
            const val = m.data?.p75 || 0;
            const status =
              val <= m.good ? "good" : val <= m.poor ? "needs-improvement" : "poor";
            const color =
              status === "good"
                ? "text-green-500"
                : status === "needs-improvement"
                  ? "text-yellow-500"
                  : "text-red-500";
            return (
              <div key={m.label} className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                <p className={`text-2xl font-bold font-mono ${color}`}>
                  {m.label === "CLS" ? val.toFixed(3) : Math.round(val)}
                  {m.unit}
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  p75 &middot; {m.data?.count || 0} samples
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
