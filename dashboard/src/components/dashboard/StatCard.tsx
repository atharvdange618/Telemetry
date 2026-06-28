import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "./InfoTooltip";

export function ChangeIndicator({ change }: { change: number }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full font-mono ${
        change >= 0
          ? "bg-green-500/10 text-green-500"
          : "bg-red-500/10 text-red-500"
      }`}
    >
      {change >= 0 ? "\u2191" : "\u2193"} {Math.abs(change)}%
    </span>
  );
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  isLoading,
  tooltip,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  change?: number;
  isLoading?: boolean;
  tooltip?: string;
}) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:border-border/20 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-8 translate-x-8 group-hover:bg-primary/8 transition-colors duration-500" />
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {tooltip && <InfoTooltip content={tooltip} />}
        </div>
        <div className="p-1.5 rounded-lg bg-primary/8">
          <Icon className="h-3.5 w-3.5 text-primary/70" />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex items-baseline gap-2">
          <div className="text-2xl md:text-3xl font-bold tracking-tight font-mono tabular-nums">
            {isLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded-lg" />
            ) : (
              value
            )}
          </div>
          {change !== undefined && <ChangeIndicator change={change} />}
        </div>
      </CardContent>
    </Card>
  );
}
