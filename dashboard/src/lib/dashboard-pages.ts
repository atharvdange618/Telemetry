import {
  FileText,
  Gauge,
  LayoutDashboard,
  Link2,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface DashboardPageInfo {
  slug: string;
  title: string;
  icon: LucideIcon;
}

export const DASHBOARD_PAGES: DashboardPageInfo[] = [
  { slug: "overview", title: "Overview", icon: LayoutDashboard },
  { slug: "content", title: "Content", icon: FileText },
  { slug: "sources", title: "Sources", icon: Link2 },
  { slug: "audience", title: "Audience", icon: Users },
  { slug: "conversions", title: "Conversions", icon: Target },
  { slug: "performance", title: "Performance", icon: Gauge },
];
