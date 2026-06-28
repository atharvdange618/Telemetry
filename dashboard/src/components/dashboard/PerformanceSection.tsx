import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";
import type { PerformanceResponse } from "@/lib/types/dashboard.types";
import { InfoTooltip } from "./InfoTooltip";

const metricTooltips: Record<string, string> = {
  LCP: "Largest Contentful Paint - how long it takes for the biggest thing on your page to appear. Under 2.5 seconds is good.",
  INP:
    "Interaction to Next Paint - how quickly your page responds when someone clicks or taps. Under 200ms feels instant.",
  CLS: "Cumulative Layout Shift - how much the page jiggles around while loading. Lower is better, under 0.1 is good.",
  TTFB: "Time to First Byte - how fast your server sends the first bit of data. Under 800ms means your server is fast.",
  FCP: "First Contentful Paint - when the first text or image appears on screen. Under 1.8 seconds is good.",
};

export function PerformanceSection({
  data,
}: {
  data: PerformanceResponse | undefined;
}) {
  if (!data) return null;

  const metrics = [
    { label: "LCP", data: data.lcp, unit: "ms", good: 2500, poor: 4000 },
    { label: "INP", data: data.inp || data.fid, unit: "ms", good: 200, poor: 500 },
    { label: "CLS", data: data.cls, unit: "", good: 0.1, poor: 0.25 },
    { label: "TTFB", data: data.ttfb, unit: "ms", good: 800, poor: 1800 },
    { label: "FCP", data: data.fcp, unit: "ms", good: 1800, poor: 3000 },
  ];

  return (
    <Card className="transition-all duration-300 hover:border-border/20">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/8">
          <Gauge className="h-3.5 w-3.5 text-primary/70" />
        </div>
        <CardTitle className="text-base">
          Performance (Core Web Vitals)
        </CardTitle>
        <InfoTooltip content="These measure how fast and stable your website feels to visitors. Google uses these scores to rank websites in search results." />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {metrics.map((m) => {
            const val = m.data?.p75 || 0;
            const status =
              val <= m.good
                ? "good"
                : val <= m.poor
                  ? "needs-improvement"
                  : "poor";
            const color =
              status === "good"
                ? "text-green-500"
                : status === "needs-improvement"
                  ? "text-yellow-500"
                  : "text-red-500";
            const dotColor =
              status === "good"
                ? "bg-green-500"
                : status === "needs-improvement"
                  ? "bg-yellow-500"
                  : "bg-red-500";
            return (
              <div
                key={m.label}
                className="text-center p-3 rounded-xl bg-secondary/30"
              >
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  <p className="text-xs text-muted-foreground font-medium">
                    {m.label}
                  </p>
                  {metricTooltips[m.label] && (
                    <InfoTooltip content={metricTooltips[m.label]} />
                  )}
                </div>
                <p
                  className={`text-2xl font-bold font-mono tabular-nums ${color}`}
                >
                  {m.label === "CLS" ? val.toFixed(3) : Math.round(val)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {m.unit}
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
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
