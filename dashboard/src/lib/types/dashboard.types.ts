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

export interface BrowsersResponse {
  browsers: { browser: string; views: number; percentage: number }[];
}

export interface OsResponse {
  operatingSystems: { os: string; views: number; percentage: number }[];
}

export interface LanguagesResponse {
  languages: { language: string; views: number; percentage: number }[];
}

export interface SessionsResponse {
  totalSessions: number;
  avgDurationSeconds: number;
  avgDurationFormatted: string;
}

export interface ScrollDepthResponse {
  avgScrollDepth: number;
  totalScrollEvents: number;
  distribution: { at25: number; at50: number; at75: number; at100: number };
}

export interface PerformanceMetric {
  p50: number;
  p75: number;
  p90: number;
  p99: number;
  count: number;
}

export interface PerformanceResponse {
  lcp: PerformanceMetric;
  fid: PerformanceMetric;
  cls: PerformanceMetric & {
    p50: number;
    p75: number;
    p90: number;
    p99: number;
  };
  ttfb: PerformanceMetric;
  fcp: PerformanceMetric;
}

export interface OutboundResponse {
  outboundLinks: { url: string; clicks: number }[];
}

export interface FunnelStep {
  step: string;
  visitors: number;
  conversionFromPrevious: number;
  conversionFromFirst: number;
}

export interface FunnelResponse {
  funnel: FunnelStep[];
}

export interface CohortData {
  cohort: string;
  totalVisitors: number;
  [key: string]: string | number;
}

export interface CohortsResponse {
  cohorts: CohortData[];
}

export interface Insight {
  type: string;
  title: string;
  detail: string;
  value: number;
}

export interface InsightsResponse {
  insights: Insight[];
}
