import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { InfoTooltip } from "@/components/dashboard/InfoTooltip";
import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import type { TooltipRow } from "@/components/charts/tooltip";

type AnalyticsChartProps = {
  data: Array<{ date: string | number | Date; views: number }>;
  title: string;
  tooltip?: string;
};

export function AnalyticsChart({ data, title, tooltip }: AnalyticsChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    date: d.date instanceof Date ? d.date : new Date(d.date),
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
        <CardTitle className="text-base">{title}</CardTitle>
        {tooltip && <InfoTooltip content={tooltip} />}
      </CardHeader>
      <CardContent className="pl-2">
        <AreaChart data={chartData} xDataKey="date" style={{ height: 280 }}>
          <Grid horizontal numTicksRows={5} />
          <XAxis numTicks={6} />
          <Area
            dataKey="views"
            fill="var(--chart-line-primary)"
            fillOpacity={0.15}
            stroke="var(--chart-line-primary)"
            strokeWidth={2}
          />
          <ChartTooltip
            rows={(point) => {
              const value = point.views;
              return [
                {
                  color: "var(--chart-line-primary)",
                  label: "Views",
                  value: typeof value === "number" ? value : 0,
                } satisfies TooltipRow,
              ];
            }}
          />
        </AreaChart>
      </CardContent>
    </Card>
  );
}

export default AnalyticsChart;
