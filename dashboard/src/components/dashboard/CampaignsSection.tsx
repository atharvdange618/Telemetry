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
      <Card className="transition-all duration-300 hover:border-border/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/8">
            <Megaphone className="h-3.5 w-3.5 text-primary/70" />
          </div>
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
      <Card className="transition-all duration-300 hover:border-border/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/8">
            <Megaphone className="h-3.5 w-3.5 text-primary/70" />
          </div>
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
