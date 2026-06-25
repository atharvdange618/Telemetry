import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Link2 } from "lucide-react";
import { SimpleTable } from "./SimpleTable";
import type { PagesResponse, ReferrersResponse } from "@/lib/types/dashboard.types";

export function PagesReferrersSection({
  pages,
  referrers,
}: {
  pages: PagesResponse | undefined;
  referrers: ReferrersResponse | undefined;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <Card className="lg:col-span-2 transition-all duration-300 hover:border-border/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/8">
            <FileText className="h-3.5 w-3.5 text-primary/70" />
          </div>
          <CardTitle className="text-base">Top Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            data={pages?.pages || []}
            labelKey="path"
            valueKey="views"
            valueLabel="Views"
          />
        </CardContent>
      </Card>
      <Card className="transition-all duration-300 hover:border-border/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/8">
            <Link2 className="h-3.5 w-3.5 text-primary/70" />
          </div>
          <CardTitle className="text-base">Top Referrers</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            data={referrers?.referrers || []}
            labelKey="referrer"
            valueKey="views"
            valueLabel="Views"
          />
        </CardContent>
      </Card>
    </div>
  );
}
