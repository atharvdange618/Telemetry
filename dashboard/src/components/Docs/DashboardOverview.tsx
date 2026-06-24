import {
  ChevronsUpDown,
  CalendarDays,
  Settings,
  LogOut,
  AreaChart,
  Map,
  Users,
  File,
  Link as LinkIcon,
  Crosshair,
  BarChart3,
  Megaphone,
} from "lucide-react";

const DashboardOverview = () => {
  return (
    <section id="overview" className="mb-16">
      <h2 className="text-3xl font-bold text-foreground mb-6">
        Dashboard Overview
      </h2>
      <div className="bg-card dark:bg-gray-900 rounded-lg border border-border p-8">
        <p className="text-muted-foreground mb-8 text-lg">
          The Telemetry dashboard provides a clean, intuitive interface for
          viewing your website analytics. All data is presented in an
          easy-to-understand format focused on actionable insights.
        </p>

        <h3 className="text-xl font-semibold text-foreground mb-6">
          Anatomy of the Dashboard
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              Header Controls
            </h4>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <ChevronsUpDown className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Site Switcher:</strong> Switch between different
                  websites you are tracking.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Period Filter:</strong> Filter data by{" "}
                  <strong>24h</strong>, <strong>7d</strong>, or{" "}
                  <strong>30d</strong>.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Settings:</strong> Manage sites, domains, and
                  tracking code.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <LogOut className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Logout:</strong> Securely sign out with confirmation
                  dialog.
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">
              Dashboard Widgets
            </h4>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Summary Cards:</strong> Page views, unique visitors
                  (with period comparison), and engagement metrics.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <AreaChart className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Views Over Time:</strong> Line chart showing traffic
                  trends.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Map className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Locations:</strong> World map and top countries/cities
                  tables.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Devices:</strong> Mobile/tablet/desktop breakdown
                  with visual bars.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <File className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Top Pages:</strong> Most viewed pages on your site.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <LinkIcon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Referrers & Sources:</strong> Where your traffic
                  comes from.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Megaphone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Campaigns:</strong> UTM mediums and campaign
                  performance.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Crosshair className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Goals:</strong> Custom conversion tracking.
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-muted border border-border rounded-lg p-4">
          <h5 className="font-medium text-foreground mb-2">Getting Started</h5>
          <p className="text-muted-foreground text-sm">
            After signing in with GitHub, a default site is automatically
            created for you. Add the tracking script to your website and data
            will appear within seconds.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DashboardOverview;
