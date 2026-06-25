import { Button } from "@/components/ui/button";
import type {
  BrowsersResponse,
  OsResponse,
  LanguagesResponse,
  LocationsResponse,
} from "@/lib/types/dashboard.types";

type Segments = {
  browser?: string;
  os?: string;
  country?: string;
  language?: string;
  device?: "mobile" | "tablet" | "desktop";
};

interface FiltersBarProps {
  show: boolean;
  customRange: boolean;
  startDate: string;
  endDate: string;
  segments: Segments;
  browsersData: BrowsersResponse | undefined;
  osData: OsResponse | undefined;
  locationsData: LocationsResponse | undefined;
  languagesData: LanguagesResponse | undefined;
  hasActiveFilters: boolean;
  onSetStartDate: (v: string) => void;
  onSetEndDate: (v: string) => void;
  onSetSegment: (key: keyof Segments, value: string) => void;
  onClearSegments: () => void;
}

export function FiltersBar({
  show,
  customRange,
  startDate,
  endDate,
  segments,
  browsersData,
  osData,
  locationsData,
  languagesData,
  hasActiveFilters,
  onSetStartDate,
  onSetEndDate,
  onSetSegment,
  onClearSegments,
}: FiltersBarProps) {
  return (
    <>
      {customRange && (
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-xl border border-border bg-card">
          <span className="text-sm text-muted-foreground">From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onSetStartDate(e.target.value)}
            className="px-3 py-1 text-sm rounded-lg border border-border bg-background"
          />
          <span className="text-sm text-muted-foreground">To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onSetEndDate(e.target.value)}
            className="px-3 py-1 text-sm rounded-lg border border-border bg-background"
          />
        </div>
      )}

      {show && (
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-xl border border-border bg-card">
          <span className="text-sm font-medium text-muted-foreground">
            Filters:
          </span>
          <select
            value={segments.browser || ""}
            onChange={(e) => onSetSegment("browser", e.target.value)}
            className="px-2 py-1 text-sm rounded-lg border border-border bg-background"
          >
            <option value="">All Browsers</option>
            {browsersData?.browsers?.map((b) => (
              <option key={b.browser} value={b.browser}>
                {b.browser}
              </option>
            ))}
          </select>
          <select
            value={segments.os || ""}
            onChange={(e) => onSetSegment("os", e.target.value)}
            className="px-2 py-1 text-sm rounded-lg border border-border bg-background"
          >
            <option value="">All OS</option>
            {osData?.operatingSystems?.map((o) => (
              <option key={o.os} value={o.os}>
                {o.os}
              </option>
            ))}
          </select>
          <select
            value={segments.country || ""}
            onChange={(e) => onSetSegment("country", e.target.value)}
            className="px-2 py-1 text-sm rounded-lg border border-border bg-background"
          >
            <option value="">All Countries</option>
            {locationsData?.locations?.map((l) => (
              <option key={l.country} value={l.country}>
                {l.country}
              </option>
            ))}
          </select>
          <select
            value={segments.language || ""}
            onChange={(e) => onSetSegment("language", e.target.value)}
            className="px-2 py-1 text-sm rounded-lg border border-border bg-background"
          >
            <option value="">All Languages</option>
            {languagesData?.languages?.map((l) => (
              <option key={l.language} value={l.language}>
                {l.language}
              </option>
            ))}
          </select>
          <select
            value={segments.device || ""}
            onChange={(e) => onSetSegment("device", e.target.value)}
            className="px-2 py-1 text-sm rounded-lg border border-border bg-background"
          >
            <option value="">All Devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSegments}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      )}
    </>
  );
}
