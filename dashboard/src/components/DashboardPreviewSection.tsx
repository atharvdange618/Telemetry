import { ChevronDown } from "lucide-react";

export function DashboardPreviewSection() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-12 md:mb-16">
          Your Dashboard: Simple & Powerful
        </h2>

        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8">
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            {/* Browser window mockup */}
            <div className="bg-stone-100 px-4 py-3 flex items-center border-b border-stone-200">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="ml-4 text-stone-600 text-sm">
                dashboard.telemetry.dev
              </div>
            </div>

            <div className="p-6 bg-stone-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-4 mb-8">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-semibold text-stone-900">
                    My Website
                  </h1>
                  <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 border border-stone-200">
                    <span className="text-stone-700">My Website</span>
                    <ChevronDown />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="bg-gray-600 px-3 py-1 rounded-md text-sm font-medium text-white">
                    24h
                  </button>
                  <button className="text-stone-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-stone-100">
                    7d
                  </button>
                  <button className="text-stone-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-stone-100">
                    30d
                  </button>
                  <button className="text-stone-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-stone-100">
                    Settings
                  </button>
                  <button className="text-stone-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-stone-100">
                    Logout
                  </button>
                </div>
              </div>

              {/* Top metrics cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <div className="text-sm text-stone-600 mb-2">Page Views</div>
                  <div className="text-4xl font-bold text-stone-900">0</div>
                </div>
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <div className="text-sm text-stone-600 mb-2">
                    Unique Visitors
                  </div>
                  <div className="text-4xl font-bold text-stone-900">0</div>
                </div>
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <div className="text-sm text-stone-600 mb-2">Bounce Rate</div>
                  <div className="text-4xl font-bold text-stone-900">0%</div>
                </div>
              </div>

              {/* Views over time chart */}
              <div className="bg-white rounded-lg border border-stone-200 p-6 mb-8">
                <h3 className="text-lg font-semibold text-stone-900 mb-4">
                  Views Over Time
                </h3>
                <div className="h-64 bg-stone-50 rounded-lg flex items-center justify-center">
                  <div className="text-stone-400 text-sm">
                    Chart visualization area
                  </div>
                </div>
              </div>

              {/* Bottom section with locations and tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Locations with world map */}
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h3 className="text-lg font-semibold text-stone-900 mb-4">
                    Locations
                  </h3>
                  <div className="h-48 bg-stone-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-stone-400 text-sm">🗺️ World Map</div>
                  </div>
                </div>

                {/* Top Countries */}
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h3 className="text-lg font-semibold text-stone-900 mb-4">
                    Top Countries
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Country</span>
                      <span className="text-stone-600">Views</span>
                    </div>
                    <div className="h-32 flex items-center justify-center text-stone-400 text-sm">
                      No data available
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h3 className="text-lg font-semibold text-stone-900 mb-4">
                    Top Pages
                  </h3>
                  <div className="text-sm text-stone-400">
                    No data available
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h3 className="text-lg font-semibold text-stone-900 mb-4">
                    Top Goals
                  </h3>
                  <div className="text-sm text-stone-400">
                    No data available
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h3 className="text-lg font-semibold text-stone-900 mb-4">
                    Top Sources
                  </h3>
                  <div className="text-sm text-stone-400">
                    No data available
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h3 className="text-lg font-semibold text-stone-900 mb-4">
                    Top Referrers
                  </h3>
                  <div className="text-sm text-stone-400">
                    No data available
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
