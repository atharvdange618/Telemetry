import { createHmac } from "crypto";

// Bounds how long a visitorId hash can stay stable for the same
// ip+userAgent+tenant, without breaking the multi-week continuity that
// cohort retention and period-over-period comparisons rely on. Longer
// than any existing analysis window (90d periods, 8-week cohorts), so
// those stay accurate across a full rotation cycle in practice.
function getQuarterLabel(date: Date): string {
  const year = date.getUTCFullYear();
  const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
  return `${year}-Q${quarter}`;
}

export function getRotatingSalt(baseSecret: string, date: Date = new Date()): string {
  return createHmac("sha256", baseSecret).update(getQuarterLabel(date)).digest("hex");
}
