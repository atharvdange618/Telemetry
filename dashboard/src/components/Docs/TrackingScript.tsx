import { CodeBlock } from "../CodeBlock";

const TrackingScript = () => {
  return (
    <section id="tracking-script" className="mb-16">
      <h2 className="text-3xl font-bold text-foreground mb-6">
        Tracking Script
      </h2>
      <div className="bg-card dark:bg-gray-900 rounded-lg border border-border p-6">
        <p className="text-muted-foreground mb-6">
          Once you have Telemetry set up, add the tracking script to your
          website. It's a lightweight (~1KB), privacy-focused script that won't
          slow down your site.
        </p>

        <h3 className="text-xl font-semibold text-foreground mb-3">
          Basic Implementation
        </h3>
        <p className="text-muted-foreground mb-4">
          Add this script tag to the{" "}
          <code className="bg-muted px-2 py-1 rounded text-sm">
            &lt;head&gt;
          </code>{" "}
          section of all pages you want to track.
        </p>
        <CodeBlock
          code={`<script 
  async
  src="https://your-telemetry-domain.com/analytics.js"
  data-tenant-id="your-site-id"
></script>`}
        />
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
          <p className="text-amber-600 dark:text-amber-400 text-sm">
            <strong>Important:</strong> Replace{" "}
            <code>your-telemetry-domain.com</code> with your Telemetry instance
            URL and <code>your-site-id</code> with the tenant ID from your
            dashboard.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">
          What Gets Tracked
        </h3>
        <p className="text-muted-foreground mb-4">
          The script automatically collects the following on each pageview:
        </p>
        <ul className="text-muted-foreground mb-6 space-y-2 list-disc list-inside">
          <li>
            <strong>Hostname, Path & Referrer:</strong> The current URL and
            where the visitor came from.
          </li>
          <li>
            <strong>Screen Dimensions:</strong> For understanding device usage
            (e.g., 1920x1080).
          </li>
          <li>
            <strong>Location Data:</strong> Anonymous country and city data (IP
            addresses are never stored).
          </li>
          <li>
            <strong>UTM Parameters:</strong> All standard UTM tags
            (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`,
            `utm_content`) for campaign tracking.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">
          Tracking in Single-Page Applications (SPAs)
        </h3>
        <p className="text-muted-foreground mb-4">
          The script automatically tracks the initial page load. For SPAs
          (React, Vue, etc.), you must manually trigger a pageview event on each
          route change.
        </p>
        <p className="text-muted-foreground mb-4">
          Use the <code>window.telemetry.pageview()</code> function after a
          navigation event occurs in your application.
        </p>
        <CodeBlock
          code={`// Example for a React application using React Router
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function usePageViews() {
  const location = useLocation();

  useEffect(() => {
    if (window.telemetry && typeof window.telemetry.pageview === 'function') {
      window.telemetry.pageview();
    }
  }, [location.pathname]);
}`}
        />

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">
          Custom Goal Tracking
        </h3>
        <p className="text-muted-foreground mb-4">
          Track custom events like newsletter signups or button clicks using the{" "}
          <code>goal</code> function.
        </p>
        <CodeBlock
          code={`// Track a goal completion by name
window.telemetry.goal('newsletter-signup');

// Example: Track a button click
const signupButton = document.getElementById('signup-btn');
signupButton.addEventListener('click', () => {
  window.telemetry.goal('newsletter-signup');
});`}
        />

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">
          Performance & Privacy
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-muted border border-border rounded-lg p-4">
            <h5 className="font-medium text-foreground mb-2">
              Performance-First
            </h5>
            <p className="text-muted-foreground text-sm">
              The script is asynchronous and uses{" "}
              <code>navigator.sendBeacon</code> to send data, which doesn't
              block page rendering or unloading. This ensures no performance
              impact on your site.
            </p>
          </div>
          <div className="bg-muted border border-border rounded-lg p-4">
            <h5 className="font-medium text-foreground mb-2">
              Privacy by Design
            </h5>
            <p className="text-muted-foreground text-sm">
              No cookies or local storage are used. Visitor identification is
              done anonymously using a hashed IP and User Agent, ensuring GDPR
              compliance without consent banners.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrackingScript;
