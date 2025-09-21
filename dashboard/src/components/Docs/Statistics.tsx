import { CodeBlock } from "../CodeBlock";

const Statistics = () => {
  return (
    <section id="statistics" className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Statistics API</h2>
      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <p className="text-gray-700 mb-6">
          The Statistics API provides access to all processed analytics data.
          All endpoints require authentication via a session cookie and share a
          common set of query parameters and error responses.
        </p>

        {/* --- Common Rules --- */}
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Common Rules
        </h3>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Query Parameters</h4>
            <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
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
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 mb-2">Error Responses</h4>
            <ul className="text-amber-800 text-sm space-y-1 list-disc list-inside">
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

        {/* --- API Endpoints --- */}
        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
          Endpoints
        </h3>
        <div className="space-y-6">
          {/* GET /api/stats/summary */}
          <div className="border border-stone-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                GET
              </span>
              <code>/api/stats/summary</code>
            </div>
            <p className="text-gray-600 mb-3 text-sm">
              Returns core metrics: total page views, unique visitors, and
              bounce rate.
            </p>
            <CodeBlock
              code={`{
  "pageViews": 1250,
  "uniqueVisitors": 890,
  "bounceRate": 45.5
}`}
            />
          </div>

          {/* GET /api/stats/views-over-time */}
          <div className="border border-stone-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                GET
              </span>
              <code>/api/stats/views-over-time</code>
            </div>
            <p className="text-gray-600 mb-3 text-sm">
              Returns an array of data points for chart visualizations, grouped
              by day or hour depending on the period.
            </p>
            <CodeBlock
              code={`{
  "views": [
    { "date": "2025-01-01T00:00:00.000Z", "views": 45 },
    { "date": "2025-01-02T00:00:00.000Z", "views": 52 }
  ]
}`}
            />
          </div>

          {/* GET /api/stats/pages */}
          <div className="border border-stone-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                GET
              </span>
              <code>/api/stats/pages</code>
            </div>
            <p className="text-gray-600 mb-3 text-sm">
              Returns the top 10 most viewed pages.
            </p>
            <CodeBlock
              code={`{
  "pages": [
    { "path": "/", "views": 250 },
    { "path": "/about", "views": 120 }
  ]
}`}
            />
          </div>

          {/* GET /api/stats/referrers */}
          <div className="border border-stone-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                GET
              </span>
              <code>/api/stats/referrers</code>
            </div>
            <p className="text-gray-600 mb-3 text-sm">
              Returns the top 10 referrer sources. Empty referrers are grouped
              as "Direct".
            </p>
            <CodeBlock
              code={`{
  "referrers": [
    { "referrer": "google.com", "views": 300 },
    { "referrer": "Direct", "views": 150 }
  ]
}`}
            />
          </div>

          {/* GET /api/stats/sources */}
          <div className="border border-stone-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                GET
              </span>
              <code>/api/stats/sources</code>
            </div>
            <p className="text-gray-600 mb-3 text-sm">
              Returns the top 10 UTM sources.
            </p>
            <CodeBlock
              code={`{
  "sources": [
    { "source": "google", "views": 95 },
    { "source": "newsletter", "views": 42 }
  ]
}`}
            />
          </div>

          {/* GET /api/stats/locations */}
          <div className="border border-stone-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                GET
              </span>
              <code>/api/stats/locations</code>
            </div>
            <p className="text-gray-600 mb-3 text-sm">
              Returns the top 20 countries by page views.
            </p>
            <CodeBlock
              code={`{
  "locations": [
    { "country": "US", "views": 400 },
    { "country": "DE", "views": 110 }
  ]
}`}
            />
          </div>

          {/* GET /api/stats/goals */}
          <div className="border border-stone-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                GET
              </span>
              <code>/api/stats/goals</code>
            </div>
            <p className="text-gray-600 mb-3 text-sm">
              Returns the top 10 completed goals.
            </p>
            <CodeBlock
              code={`{
  "goals": [
    { "name": "newsletter-signup", "completions": 50 },
    { "name": "download-file", "completions": 25 }
  ]
}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
