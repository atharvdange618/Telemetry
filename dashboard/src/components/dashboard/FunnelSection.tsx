import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Filter, AlertTriangle } from "lucide-react";
import type { DateRange, FunnelResponse } from "@/lib/types/dashboard.types";
import { InfoTooltip } from "./InfoTooltip";
import { FunnelChart, type FunnelStage } from "@/components/charts/funnel-chart";
import { normalizePath } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_URL;

const fetchAPI = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  const res = await fetch(url, { ...options, credentials: "include", headers });
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

interface FunnelSectionProps {
  tenantId: string;
  range: DateRange;
}

export function FunnelSection({ tenantId, range }: FunnelSectionProps) {
  const [steps, setSteps] = useState<string[]>(["/", "/pricing"]);
  // Keying the query on the submitted steps plus the dashboard range means the
  // funnel re-runs when the period changes, like every other stat on the page.
  const [submittedSteps, setSubmittedSteps] = useState<string[] | null>(null);

  const funnelQuery = useQuery({
    queryKey: ["funnel", tenantId, range, submittedSteps],
    queryFn: () =>
      fetchAPI<FunnelResponse>(`${API_URL}/api/stats/funnels`, {
        method: "POST",
        body: JSON.stringify({ tenantId, steps: submittedSteps, ...range }),
      }),
    enabled: !!tenantId && !!submittedSteps,
    // The section shows its own error message.
    meta: { silentError: true },
  });
  const result = funnelQuery.data;

  const addStep = () => setSteps([...steps, ""]);
  const removeStep = (index: number) => {
    if (steps.length <= 2) return;
    setSteps(steps.filter((_, i) => i !== index));
  };
  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const handleAnalyze = () => {
    const validSteps = steps.filter((s) => s.trim()).map(normalizePath);
    if (validSteps.length < 2 || !tenantId) return;
    // Show the normalized paths, so "pricing" visibly becomes "/pricing".
    setSteps(validSteps);
    if (JSON.stringify(validSteps) === JSON.stringify(submittedSteps)) {
      funnelQuery.refetch();
    } else {
      setSubmittedSteps(validSteps);
    }
  };

  const funnelData: FunnelStage[] =
    result?.funnel?.map((s, i) => ({
      label: s.step,
      value: s.visitors,
      color: i === 0 ? "var(--chart-line-primary)" : undefined,
    })) || [];

  const hasNoData = result && result.funnel && result.funnel.every((s) => s.visitors === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Funnel Analysis
          <InfoTooltip content="Track how many visitors complete each step of a journey (e.g. Homepage → Pricing → Signup → Checkout). Enter the page paths in order, and see where people drop off." />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex items-center justify-center w-6 h-9 text-xs font-medium text-muted-foreground bg-muted rounded">
                {i + 1}
              </div>
              <Input
                placeholder="/path (e.g., /signup)"
                value={step}
                onChange={(e) => updateStep(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAnalyze();
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => removeStep(i)}
                disabled={steps.length <= 2}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addStep} className="gap-1">
            <Plus className="h-3.5 w-3.5" /> Add Step
          </Button>
          <Button
            onClick={handleAnalyze}
            disabled={funnelQuery.isFetching || steps.filter((s) => s.trim()).length < 2 || !tenantId}
          >
            {funnelQuery.isFetching ? "Analyzing..." : "Analyze Funnel"}
          </Button>
        </div>

        {funnelQuery.isError && (
          <p className="text-sm text-destructive">
            Couldn't run the funnel. Check your connection and try again.
          </p>
        )}

        {hasNoData && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 text-sm flex gap-3 items-start mt-4">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">No visitor data found for these steps</p>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                Make sure the page paths match exactly what is being tracked (including any subdirectories or file extensions).
                For example, use <code className="font-mono text-foreground px-1 py-0.5 bg-muted rounded border border-muted">/test-pages/home.html</code> instead of <code className="font-mono text-foreground px-1 py-0.5 bg-muted rounded border border-muted">/home.html</code> if the tracked paths are prefixed.
              </p>
            </div>
          </div>
        )}

        {funnelData.length > 0 && !hasNoData && (
          <div className="mt-4">
            <FunnelChart
              data={funnelData}
              orientation="horizontal"
              showPercentage
              showValues
              showLabels
              gap={6}
              style={{ height: 320 }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
