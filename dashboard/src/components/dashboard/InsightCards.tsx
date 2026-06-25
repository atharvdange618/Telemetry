import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import type { InsightsResponse } from "@/lib/types/dashboard.types";

export function InsightCards({ data }: { data: InsightsResponse | undefined }) {
  if (!data?.insights?.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {data.insights.map((insight, i) => (
        <Card key={i} className="border-l-2 border-l-primary/30 transition-all duration-300 hover:border-l-primary/60 hover:border-border/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-primary/8 shrink-0">
                <Lightbulb className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <div>
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
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
