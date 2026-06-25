import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Megaphone, MapPin, ExternalLink } from "lucide-react";
import { SimpleTable } from "./SimpleTable";
import type {
  GoalsResponse,
  UtmSourcesResponse,
  CitiesResponse,
  OutboundResponse,
} from "@/lib/types/dashboard.types";

export function GoalsSection({
  goals,
  sources,
  cities,
  outbound,
}: {
  goals: GoalsResponse | undefined;
  sources: UtmSourcesResponse | undefined;
  cities: CitiesResponse | undefined;
  outbound: OutboundResponse | undefined;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="transition-all duration-300 hover:border-border/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/8">
            <Target className="h-3.5 w-3.5 text-primary/70" />
          </div>
          <CardTitle className="text-base">Top Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            data={goals?.goals || []}
            labelKey="name"
            valueKey="completions"
            valueLabel="Count"
          />
        </CardContent>
      </Card>
      <Card className="transition-all duration-300 hover:border-border/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/8">
            <Megaphone className="h-3.5 w-3.5 text-primary/70" />
          </div>
          <CardTitle className="text-base">Top Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            data={sources?.sources || []}
            labelKey="source"
            valueKey="views"
            valueLabel="Views"
          />
        </CardContent>
      </Card>
      <Card className="transition-all duration-300 hover:border-border/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/8">
            <MapPin className="h-3.5 w-3.5 text-primary/70" />
          </div>
          <CardTitle className="text-base">Top Cities</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            data={cities?.cities || []}
            labelKey="city"
            valueKey="views"
            valueLabel="Views"
          />
        </CardContent>
      </Card>
      <Card className="transition-all duration-300 hover:border-border/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/8">
            <ExternalLink className="h-3.5 w-3.5 text-primary/70" />
          </div>
          <CardTitle className="text-base">Outbound Links</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            data={(outbound?.outboundLinks || []).map((o) => ({
              url: new URL(o.url).hostname,
              clicks: o.clicks,
            }))}
            labelKey="url"
            valueKey="clicks"
            valueLabel="Clicks"
          />
        </CardContent>
      </Card>
    </div>
  );
}
