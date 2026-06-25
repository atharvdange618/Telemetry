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
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground/60" />
          <CardTitle className="text-base">Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationMap data={data} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground/60" />
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
