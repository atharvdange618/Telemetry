export interface Tenant {
  id: string;
  name: string;
}

export interface TenantsResponse {
  tenants: Tenant[];
}

export interface StatsSummary {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
}

export interface PageStat {
  path: string;
  views: number;
}

export interface PagesResponse {
  pages: PageStat[];
}

export interface ReferrerStat {
  referrer: string;
  views: number;
}

export interface ReferrersResponse {
  referrers: ReferrerStat[];
}

export interface ViewsOverTimeDataPoint {
  date: string;
  views: number;
}

export interface ViewsOverTimeResponse {
  views: ViewsOverTimeDataPoint[];
}