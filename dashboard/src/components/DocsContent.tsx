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
    <div className="prose prose-stone dark:prose-invert">
      <Introduction />

      <Installation />

      <DashboardOverview />

      <Metrics />

      <SiteSettings />

      <TrackingScript />

      <TrackingEndpoints />

      <Authentication />

      <Statistics />

      <Architecture />

      <DatabaseSchema />

      <PrivacyAndSecurity />
    </div>
  );
}
