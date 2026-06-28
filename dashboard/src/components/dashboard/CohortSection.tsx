import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import type { CohortsResponse, CohortData } from "@/lib/types/dashboard.types";

const API_URL = import.meta.env.VITE_API_URL;

const fetchAPI = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

interface CohortSectionProps {
  queryParams: string;
  enabled: boolean;
}

function getRetentionColor(percentage: number): string {
  if (percentage >= 80) return "bg-green-500/20 text-green-700 dark:text-green-400";
  if (percentage >= 60) return "bg-green-500/15 text-green-600 dark:text-green-400";
  if (percentage >= 40) return "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400";
  if (percentage >= 20) return "bg-orange-500/15 text-orange-600 dark:text-orange-400";
  if (percentage > 0) return "bg-red-500/10 text-red-600 dark:text-red-400";
  return "text-muted-foreground";
}

export function CohortSection({ queryParams, enabled }: CohortSectionProps) {
  const { data, isLoading } = useQuery<CohortsResponse>({
    queryKey: ["stats", "cohorts", queryParams],
    queryFn: () => fetchAPI(`${API_URL}/api/stats/cohorts?${queryParams}`),
    enabled,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Cohort Retention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading cohorts...</p>
        </CardContent>
      </Card>
    );
  }

  const cohorts = data?.cohorts || [];

  if (cohorts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Cohort Retention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No cohort data available for this period.
          </p>
        </CardContent>
      </Card>
    );
  }

  const weeks = Array.from({ length: 8 }, (_, i) => `week${i}`);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Cohort Retention
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Cohort</TableHead>
                <TableHead className="text-right w-20">Users</TableHead>
                {weeks.map((_, i) => (
                  <TableHead key={i} className="text-center w-16">
                    Week {i}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {cohorts.map((row: CohortData) => {
                const total = row.totalVisitors;
                return (
                  <TableRow key={row.cohort}>
                    <TableCell className="font-mono text-sm">
                      {row.cohort}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {total.toLocaleString()}
                    </TableCell>
                    {weeks.map((week, i) => {
                      const val = row[week];
                      const count = typeof val === "number" ? val : 0;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <TableCell
                          key={i}
                          className={`text-center text-xs font-medium ${getRetentionColor(pct)}`}
                        >
                          {pct}%
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Shows weekly retention for the last 8 cohorts. Each cell shows the percentage of users who returned that week.
        </p>
      </CardContent>
    </Card>
  );
}
