import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Globe } from "lucide-react";
import { SimpleTable } from "./SimpleTable";
import type {
  BrowsersResponse,
  OsResponse,
  LanguagesResponse,
  DevicesResponse,
} from "@/lib/types/dashboard.types";

function DevicesBar({ data }: { data: DevicesResponse | undefined }) {
  if (!data) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No device data yet
      </p>
    );
  }

  const total =
    data.devices.mobile + data.devices.tablet + data.devices.desktop;
  const items = [
    { label: "Desktop", value: data.devices.desktop, color: "bg-primary" },
    { label: "Mobile", value: data.devices.mobile, color: "bg-accent" },
    { label: "Tablet", value: data.devices.tablet, color: "bg-chart-3" },
  ];

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium tabular-nums font-mono text-xs text-foreground">
              {total > 0 ? Math.round((item.value / total) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${item.color}`}
              style={{
                width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TechSection({
  browsers,
  os,
  languages,
  devices,
}: {
  browsers: BrowsersResponse | undefined;
  os: OsResponse | undefined;
  languages: LanguagesResponse | undefined;
  devices: DevicesResponse | undefined;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="transition-all duration-300 hover:border-border/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/8">
            <Monitor className="h-3.5 w-3.5 text-primary/70" />
          </div>
          <CardTitle className="text-base">Browsers</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            data={browsers?.browsers || []}
            labelKey="browser"
            valueKey="percentage"
            valueLabel="%"
          />
        </CardContent>
      </Card>
      <Card className="transition-all duration-300 hover:border-border/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/8">
            <Monitor className="h-3.5 w-3.5 text-primary/70" />
          </div>
          <CardTitle className="text-base">Operating Systems</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            data={os?.operatingSystems || []}
            labelKey="os"
            valueKey="percentage"
            valueLabel="%"
          />
        </CardContent>
      </Card>
      <Card className="transition-all duration-300 hover:border-border/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/8">
            <Globe className="h-3.5 w-3.5 text-primary/70" />
          </div>
          <CardTitle className="text-base">Languages</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            data={languages?.languages || []}
            labelKey="language"
            valueKey="percentage"
            valueLabel="%"
          />
        </CardContent>
      </Card>
      <Card className="transition-all duration-300 hover:border-border/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/8">
            <Monitor className="h-3.5 w-3.5 text-primary/70" />
          </div>
          <CardTitle className="text-base">Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <DevicesBar data={devices} />
        </CardContent>
      </Card>
    </div>
  );
}
