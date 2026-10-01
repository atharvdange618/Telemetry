import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function SetupWarning({ siteName }: { siteName: string }) {
  const navigate = useNavigate();
  return (
    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 text-sm flex flex-col sm:flex-row gap-3 sm:items-center">
      <div className="flex gap-3 items-start flex-1">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Finish setting up {siteName}</p>
          <p className="text-muted-foreground mt-0.5 leading-relaxed">
            The tracking script's events are blocked until you add your
            site's domain, so this dashboard will stay empty.
          </p>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={() => navigate("/sites")}>
        Add domain
      </Button>
    </div>
  );
}
