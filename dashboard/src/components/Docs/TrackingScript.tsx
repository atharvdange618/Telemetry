import { CodeBlock } from "../CodeBlock";

const TrackingScript = () => {
  return (
    <section id="tracking-script" className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Tracking Script</h2>
      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <p className="text-gray-700 mb-6">
          Once you have Telemetry set up, add the tracking script to your
          website. It's a lightweight (~1KB), privacy-focused script that won't
          slow down your site.
        </p>

        {/* --- Basic Implementation --- */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          Basic Implementation
        </h3>
        <p className="text-gray-600 mb-4">
          Add this script tag to the{" "}
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
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
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
          <p className="text-amber-800 text-sm">
            <strong>Important:</strong> Replace{" "}
            <code>your-telemetry-domain.com</code> with your Telemetry instance
            URL and <code>your-site-id</code> with the tenant ID from your
            dashboard.
          </p>
        </div>

        {/* --- What Gets Tracked --- */}
        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          What Gets Tracked
        </h3>
        <p className="text-gray-600 mb-4">
          The script automatically collects the following on each pageview:
        </p>
        <ul className="text-gray-600 mb-6 space-y-2 list-disc list-inside">
          <li>
            <strong>Hostname, Path & Referrer:</strong> The current URL and
            where the visitor came from.
          </li>
          <li>
            <strong>Screen Dimensions:</strong> For understanding device ugray
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

        {/* --- Tracking in Single-Page Applications (SPAs) --- */}
        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          Tracking in Single-Page Applications (SPAs)
        </h3>
        <p className="text-gray-600 mb-4">
          The script automatically tracks the initial page load. For SPAs
          (React, Vue, etc.), you must manually trigger a pageview event on each
          route change.
        </p>
        <p className="text-gray-600 mb-4">
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

        {/* --- Custom Goal Tracking --- */}
        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          Custom Goal Tracking
        </h3>
        <p className="text-gray-600 mb-4">
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

        {/* --- Performance & Privacy --- */}
        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          Performance & Privacy
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">
              Performance-First
            </h5>
            <p className="text-gray-700 text-sm">
              The script is asynchronous and uses{" "}
              <code>navigator.sendBeacon</code> to send data, which doesn't
              block page rendering or unloading. This ensures no performance
              impact on your site.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">
              Privacy by Design
            </h5>
            <p className="text-gray-700 text-sm">
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
