export default function SitesDashboard() {
  return (
    <div className="bg-stone-50 p-6">
      <button className="mb-6 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 shadow-sm">
        ← Back to Dashboard
      </button>

      {/* Create New Site */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">
          Create New Site
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Add a new website to your account.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="My Awesome Blog"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
          <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            Create
          </button>
        </div>
      </div>

      {/* Your Sites */}
      <h3 className="mb-4 text-xl font-bold text-gray-800">Your Sites</h3>

      <div className="space-y-6">
        {/* Site Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="mb-4 text-lg font-semibold text-gray-800">
            John Doe's Site
          </h4>
          <p className="mb-2 text-sm font-medium text-gray-700">Embed Script</p>
          <input
            type="text"
            readOnly
            value='<script async defer src="http://localhost:3000/analytics.js" data-tenant-id="TENENT_ID_HERE"></script>'
            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-mono text-gray-700"
          />
          <div className="mt-4 flex justify-end">
            <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              Delete Site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
