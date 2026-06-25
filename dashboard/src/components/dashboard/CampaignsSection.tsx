import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone } from "lucide-react";
import { SimpleTable } from "./SimpleTable";
import type { CampaignsResponse } from "@/lib/types/dashboard.types";

export function CampaignsSection({
  data,
}: {
  data: CampaignsResponse | undefined;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Megaphone className="h-4 w-4 text-muted-foreground/60" />
          <CardTitle className="text-base">Top Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            data={data?.campaigns || []}
            labelKey="campaign"
            valueKey="views"
            valueLabel="Views"
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Megaphone className="h-4 w-4 text-muted-foreground/60" />
          <CardTitle className="text-base">Top Mediums</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            data={data?.mediums || []}
            labelKey="medium"
            valueKey="views"
            valueLabel="Views"
          />
        </CardContent>
      </Card>
    </div>
  );
}
