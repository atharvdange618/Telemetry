import Architecture from "./Docs/Architecture";
import Authentication from "./Docs/Authentication";
import DashboardOverview from "./Docs/DashboardOverview";
import DatabaseSchema from "./Docs/DatabaseSchema";
import Installation from "./Docs/Installation";
import Introduction from "./Docs/Introduction";
import Metrics from "./Docs/Metrics";
import PrivacyAndSecurity from "./Docs/PrivacyAndSecurity";
import SiteSettings from "./Docs/SiteSettings";
import Statistics from "./Docs/Statistics";
import TrackingEndpoints from "./Docs/TrackingEndpoints";
import TrackingScript from "./Docs/TrackingScript";

export function DocsContent() {
  return (
    <div className="prose prose-stone">
      {/* Introduction */}
      <Introduction />

      {/* Installation */}
      <Installation />

      {/* Dashboard Overview */}
      <DashboardOverview />

      {/* Key Metrics */}
      <Metrics />

      {/* Site Settings */}
      <SiteSettings />

      {/* Tracking Script */}
      <TrackingScript />

      {/* Tracking Endpoint */}
      <TrackingEndpoints />

      {/* Authentication */}
      <Authentication />

      {/* Statistics API */}
      <Statistics />

      {/* Architecture */}
      <Architecture />

      {/* Database Schema */}
      <DatabaseSchema />

      {/* Privacy & Security */}
      <PrivacyAndSecurity />
    </div>
  );
}
