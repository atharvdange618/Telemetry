export interface Tenant {
  id: string;
  name: string;
  domains: string[];
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

export interface UtmSourcesResponse {
  sources: {
    source: string;
    views: number;
  }[];
}

export interface GoalsResponse {
  goals: {
    name: string;
    completions: number;
  }[];
}

export interface LocationsResponse {
  locations: {
    country: string;
    views: number;
  }[];
}

export interface DevicesResponse {
  devices: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export interface EngagementResponse {
  avgPagesPerSession: number;
  newVisitors: number;
  returningVisitors: number;
  totalVisitors: number;
}

export interface CampaignsResponse {
  mediums: { medium: string; views: number }[];
  campaigns: { campaign: string; views: number }[];
}

export interface CitiesResponse {
  cities: { city: string; views: number }[];
}

export interface CompareResponse {
  pageViews: { current: number; previous: number; change: number };
  uniqueVisitors: { current: number; previous: number; change: number };
}
