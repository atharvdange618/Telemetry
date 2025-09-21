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
} from "lucide-react";
import { DashboardPreviewSection } from "../DashboardPreviewSection";

const DashboardOverview = () => {
  return (
    <section id="overview" className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Dashboard Overview
      </h2>
      <div className="bg-white rounded-lg border border-stone-200 p-8">
        <p className="text-gray-700 mb-8 text-lg">
          The Telemetry dashboard provides a clean, intuitive interface for
          viewing your website analytics. All data is presented in an
          easy-to-understand format focused on actionable insights.
        </p>

        <div className="mb-10 border border-dashed border-stone-300 rounded-lg text-center bg-stone-50">
          <DashboardPreviewSection />
        </div>

        {/* --- Anatomy of the Dashboard --- */}
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Anatomy of the Dashboard
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Header Controls */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              Header Controls
            </h4>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start gap-3">
                <ChevronsUpDown className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Site Switcher:</strong> A dropdown to easily switch
                  between the different websites (tenants) you are tracking.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Period Filter:</strong> Buttons to filter all
                  dashboard data by a specific time period: <strong>24h</strong>
                  , <strong>7d</strong>, or <strong>30d</strong>.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Settings:</strong> A link to the settings page where
                  you can manage your sites and account.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <LogOut className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Logout:</strong> A button with a confirmation dialog
                  to securely log out of your account.
                </div>
              </li>
            </ul>
          </div>

          {/* Dashboard Widgets */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              Dashboard Widgets
            </h4>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start gap-3">
                <Users className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Summary Cards:</strong> At-a-glance metrics for{" "}
                  <strong>Page Views</strong>, <strong>Unique Visitors</strong>,
                  and <strong>Bounce Rate</strong>.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <AreaChart className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Views Over Time:</strong> A chart visualizing page
                  view trends over the selected period.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Map className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Locations & Top Countries:</strong> A world map and a
                  table showing where your visitors are from.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <File className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Top Pages:</strong> A table listing the most viewed
                  pages on your site.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <LinkIcon className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Top Referrers & Sources:</strong> Two tables showing
                  where your traffic is coming from, both from direct referrers
                  and UTM sources.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Crosshair className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Top Goals:</strong> A table listing the most
                  frequently completed custom goals.
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">Getting Started</h5>
          <p className="text-gray-700 text-sm">
            After signing in with GitHub, a default site is automatically
            created for you. To see data in your dashboard, you must add the
            tracking script to your website and wait for the first visitor.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DashboardOverview;
