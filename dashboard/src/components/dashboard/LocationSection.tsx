import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, MapPin } from "lucide-react";
import { LocationMap } from "@/components/LocationMap";
import { SimpleTable } from "./SimpleTable";
import type { LocationsResponse } from "@/lib/types/dashboard.types";

export function LocationSection({
  data,
}: {
  data: LocationsResponse | undefined;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <Card className="lg:col-span-2 transition-all duration-300 hover:border-border/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/8">
            <Globe className="h-3.5 w-3.5 text-primary/70" />
          </div>
          <CardTitle className="text-base">Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationMap data={data} />
        </CardContent>
      </Card>
      <Card className="transition-all duration-300 hover:border-border/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/8">
            <MapPin className="h-3.5 w-3.5 text-primary/70" />
          </div>
          <CardTitle className="text-base">Top Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            data={data?.locations || []}
            labelKey="country"
            valueKey="views"
            valueLabel="Views"
          />
        </CardContent>
      </Card>
    </div>
  );
}
