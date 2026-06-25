import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChangeIndicator({ change }: { change: number }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
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
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  change?: number;
  isLoading?: boolean;
}) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:border-border/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground/60" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl md:text-3xl font-bold tracking-tight font-mono">
            {isLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
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
