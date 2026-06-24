import { CodeBlock } from "../CodeBlock";

const Statistics = () => {
  return (
    <section id="statistics" className="mb-16">
      <h2 className="text-3xl font-bold text-foreground mb-6">Statistics API</h2>
      <div className="bg-card dark:bg-gray-900 rounded-lg border border-border p-6">
        <p className="text-muted-foreground mb-6">
          The Statistics API provides access to all processed analytics data.
          All endpoints require authentication via a session cookie and share a
          common set of query parameters and error responses.
        </p>

        <h3 className="text-xl font-semibold text-foreground mb-4">
          Common Rules
        </h3>
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">Query Parameters</h4>
            <ul className="text-blue-600/80 dark:text-blue-300/80 text-sm space-y-1 list-disc list-inside">
              <li>
                <code>tenantId</code> (string, <strong>required</strong>): The
                ID of the site you are querying.
              </li>
              <li>
                <code>period</code> (string, optional): The time period for the
                data. Accepts <code>24h</code>, <code>7d</code>, or{" "}
                <code>30d</code>. Defaults to <code>7d</code>.
              </li>
            </ul>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2">Error Responses</h4>
            <ul className="text-amber-600/80 dark:text-amber-300/80 text-sm space-y-1 list-disc list-inside">
              <li>
                <code>401 Unauthorized</code>: Returned if the request is
                missing a valid session cookie.
              </li>
              <li>
                <code>403 Forbidden</code>: Returned if the authenticated user
                does not have access to the requested <code>tenantId</code>.
              </li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">
          Endpoints
        </h3>
        <div className="space-y-6">
          {[
            { path: "/api/stats/summary", desc: "Returns core metrics: total page views, unique visitors, and bounce rate.", code: `{\n  "pageViews": 1250,\n  "uniqueVisitors": 890,\n  "bounceRate": 45.5\n}` },
            { path: "/api/stats/views-over-time", desc: "Returns an array of data points for chart visualizations, grouped by day or hour depending on the period.", code: `{\n  "views": [\n    { "date": "2025-01-01T00:00:00.000Z", "views": 45 },\n    { "date": "2025-01-02T00:00:00.000Z", "views": 52 }\n  ]\n}` },
            { path: "/api/stats/pages", desc: "Returns the top 10 most viewed pages.", code: `{\n  "pages": [\n    { "path": "/", "views": 250 },\n    { "path": "/about", "views": 120 }\n  ]\n}` },
            { path: "/api/stats/referrers", desc: 'Returns the top 10 referrer sources. Empty referrers are grouped as "Direct".', code: `{\n  "referrers": [\n    { "referrer": "google.com", "views": 300 },\n    { "referrer": "Direct", "views": 150 }\n  ]\n}` },
            { path: "/api/stats/sources", desc: "Returns the top 10 UTM sources.", code: `{\n  "sources": [\n    { "source": "google", "views": 95 },\n    { "source": "newsletter", "views": 42 }\n  ]\n}` },
            { path: "/api/stats/locations", desc: "Returns the top 20 countries by page views.", code: `{\n  "locations": [\n    { "country": "US", "views": 400 },\n    { "country": "DE", "views": 110 }\n  ]\n}` },
            { path: "/api/stats/goals", desc: "Returns the top 10 completed goals.", code: `{\n  "goals": [\n    { "name": "newsletter-signup", "completions": 50 },\n    { "name": "download-file", "completions": 25 }\n  ]\n}` },
            { path: "/api/stats/devices", desc: "Returns visitor breakdown by device type (inferred from screen width): mobile (<768px), tablet (768-1024px), desktop (>1024px).", code: `{\n  "devices": {\n    "mobile": 450,\n    "tablet": 120,\n    "desktop": 680\n  }\n}` },
            { path: "/api/stats/engagement", desc: "Returns engagement metrics: average pages per session, and new vs returning visitor split (compares against the previous period).", code: `{\n  "avgPagesPerSession": 3.2,\n  "newVisitors": 620,\n  "returningVisitors": 270,\n  "totalVisitors": 890\n}` },
            { path: "/api/stats/campaigns", desc: "Returns top UTM mediums and campaigns for measuring marketing channel effectiveness.", code: `{\n  "mediums": [\n    { "medium": "social", "views": 200 },\n    { "medium": "cpc", "views": 150 }\n  ],\n  "campaigns": [\n    { "campaign": "spring-launch", "views": 180 },\n    { "campaign": "newsletter-june", "views": 90 }\n  ]\n}` },
            { path: "/api/stats/cities", desc: "Returns the top 20 cities by page views.", code: `{\n  "cities": [\n    { "city": "Pune", "views": 120 },\n    { "city": "Mumbai", "views": 85 }\n  ]\n}` },
            { path: "/api/stats/compare", desc: "Compares the current period against the previous period. Returns current/previous values and percentage change for page views and unique visitors.", code: `{\n  "pageViews": {\n    "current": 1250,\n    "previous": 1100,\n    "change": 13.6\n  },\n  "uniqueVisitors": {\n    "current": 890,\n    "previous": 820,\n    "change": 8.5\n  }\n}` },
          ].map((endpoint) => (
            <div key={endpoint.path} className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-500/15 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                  GET
                </span>
                <code className="text-foreground">{endpoint.path}</code>
              </div>
              <p className="text-muted-foreground mb-3 text-sm">
                {endpoint.desc}
              </p>
              <CodeBlock code={endpoint.code} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
