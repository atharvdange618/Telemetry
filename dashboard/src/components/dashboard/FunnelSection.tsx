import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Filter } from "lucide-react";
import type { FunnelStep, FunnelResponse } from "@/lib/types/dashboard.types";
import { InfoTooltip } from "./InfoTooltip";

const API_URL = import.meta.env.VITE_API_URL;

const fetchAPI = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(url, { ...options, credentials: "include" });
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

interface FunnelSectionProps {
  tenantId: string;
}

export function FunnelSection({ tenantId }: FunnelSectionProps) {
  const [steps, setSteps] = useState<string[]>(["/", "/pricing"]);
  const [result, setResult] = useState<FunnelResponse | null>(null);

  const funnelMutation = useMutation({
    mutationFn: (data: { tenantId: string; steps: string[]; period: string }) =>
      fetchAPI<FunnelResponse>(`${API_URL}/api/stats/funnels`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => setResult(data),
  });

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
    const validSteps = steps.filter((s) => s.trim());
    if (validSteps.length < 2) return;
    funnelMutation.mutate({ tenantId, steps: validSteps, period: "30d" });
  };

  const maxVisitors = result?.funnel?.[0]?.visitors || 1;

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
            disabled={funnelMutation.isPending || steps.filter((s) => s.trim()).length < 2}
          >
            {funnelMutation.isPending ? "Analyzing..." : "Analyze Funnel"}
          </Button>
        </div>

        {result?.funnel && result.funnel.length > 0 && (
          <div className="mt-4 space-y-3">
            {result.funnel.map((step, i) => {
              const width = Math.max((step.visitors / maxVisitors) * 100, 8);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono truncate mr-2">{step.step}</span>
                    <span className="text-muted-foreground whitespace-nowrap">
                      {step.visitors.toLocaleString()} visitors
                    </span>
                  </div>
                  <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-primary/80 rounded-lg transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="text-xs font-medium text-foreground">
                        {i === 0 ? "100%" : `${step.conversionFromPrevious}%`}
                        {i > 0 && (
                          <span className="text-muted-foreground ml-1">
                            (from prev)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">
              Overall conversion: {result.funnel[result.funnel.length - 1]?.conversionFromFirst}% from first step
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
