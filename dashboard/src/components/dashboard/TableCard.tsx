import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SimpleTable, type CellKey } from "./SimpleTable";

interface TableCardProps<T extends object> {
  title: string;
  icon: LucideIcon;
  data: T[];
  labelKey: CellKey<T>;
  valueKey: CellKey<T>;
  valueLabel: string;
  /** Show only the first N rows, for previews. */
  limit?: number;
  /** Adds a "View all" link in the header. */
  moreHref?: string;
  className?: string;
}

export function TableCard<T extends object>({
  title,
  icon: Icon,
  data,
  labelKey,
  valueKey,
  valueLabel,
  limit,
  moreHref,
  className,
}: TableCardProps<T>) {
  return (
    <Card className={cn("transition-all duration-300 hover:border-border/20", className)}>
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/8">
          <Icon className="h-3.5 w-3.5 text-primary/70" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
        {moreHref && (
          <Link
            to={moreHref}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <SimpleTable
          data={limit ? data.slice(0, limit) : data}
          labelKey={labelKey}
          valueKey={valueKey}
          valueLabel={valueLabel}
        />
      </CardContent>
    </Card>
  );
}
