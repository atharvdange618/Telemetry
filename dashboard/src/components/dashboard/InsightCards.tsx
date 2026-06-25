import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import type { InsightsResponse } from "@/lib/types/dashboard.types";

export function InsightCards({ data }: { data: InsightsResponse | undefined }) {
  if (!data?.insights?.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {data.insights.map((insight, i) => (
        <Card key={i} className="border-l-2 border-l-primary/40 transition-all hover:border-l-primary/70">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {insight.detail}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
