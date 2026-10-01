import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShareButton } from "@/components/dashboard/ShareButton";
import { PERIODS, type Period } from "@/lib/dashboard-params";

interface StatsToolbarProps {
  siteId: string;
  searchParams: URLSearchParams;
  period: Period;
  customRange: boolean;
  showFilters: boolean;
  hasActiveFilters: boolean;
  onSetPeriod: (period: Period) => void;
  onToggleCustomRange: () => void;
  onToggleFilters: () => void;
  onExport: (format: "csv" | "json") => void;
}

export function StatsToolbar({
  siteId,
  searchParams,
  period,
  customRange,
  showFilters,
  hasActiveFilters,
  onSetPeriod,
  onToggleCustomRange,
  onToggleFilters,
  onExport,
}: StatsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-full border border-border bg-muted/30 p-0.5">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => onSetPeriod(p)}
            className={`h-7 px-3 text-xs font-medium rounded-full transition-all duration-200 ${
              period === p && !customRange
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <Button
        variant={customRange ? "default" : "outline"}
        size="sm"
        onClick={onToggleCustomRange}
        className="h-8"
      >
        Custom
      </Button>

      <Button
        variant={showFilters ? "default" : "outline"}
        size="sm"
        onClick={onToggleFilters}
        className="gap-1 h-8"
        aria-label="Filters"
        title="Filters"
      >
        <Filter className="h-3.5 w-3.5" />
        {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
      </Button>

      <ShareButton tenantId={siteId} searchParams={searchParams} currentPeriod={period} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            aria-label="Export data"
            title="Export data"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onExport("csv")}>Export CSV</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onExport("json")}>Export JSON</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
