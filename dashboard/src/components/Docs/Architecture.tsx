import {
  Server,
  Database,
  ShieldCheck,
  Globe,
  Feather,
  Code,
  Component,
  PaintBucket,
  BarChart2,
  GitBranch,
  ArrowRight,
  Home,
  Zap,
} from "lucide-react";

const Architecture = () => {
  return (
    <section id="architecture" className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Architecture</h2>
      <div className="bg-white rounded-lg border border-stone-200 p-8">
        <p className="text-gray-700 mb-10 text-lg">
          Telemetry is built with a modern, scalable architecture that
          prioritizes performance, privacy, and maintainability.
        </p>

        {/* --- Tech Stack --- */}
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Technology Stack
        </h3>
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Backend Stack */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-6 h-6 text-gray-500" />
              <h4 className="font-semibold text-gray-900 text-lg">
                Backend Stack
              </h4>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Feather className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Fastify:</strong> High-performance, low-overhead web
                  framework.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Database className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Prisma:</strong> Next-generation, type-safe database
                  ORM for PostgreSQL.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Zod:</strong> TypeScript-first schema validation with
                  static type inference.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>MaxMind GeoLite2:</strong> For privacy-safe GeoIP
                  location services.
                </div>
              </li>
            </ul>
          </div>

          {/* Frontend Stack */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Component className="w-6 h-6 text-gray-500" />
              <h4 className="font-semibold text-gray-900 text-lg">
                Frontend Stack
              </h4>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Code className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>React & Vite:</strong> For a fast, modern
                  component-based UI.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <PaintBucket className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Tailwind CSS:</strong> A utility-first CSS framework
                  for rapid styling.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <GitBranch className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>TanStack Query:</strong> Powerful server-state
                  management for fetching and caching data.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <BarChart2 className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Recharts:</strong> A composable charting library for
                  data visualization.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* --- System Architecture Flow --- */}
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          System Data Flow
        </h3>
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-9 items-center gap-4 text-center">
            {/* Step 1: Script */}
            <div className="md:col-span-2">
              <Code className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="font-semibold text-gray-900">Tracking Script</p>
              <p className="text-xs text-gray-600">
                Lightweight script on client websites captures events.
              </p>
            </div>
            <ArrowRight className="w-6 h-6 mx-auto text-gray-400 hidden md:block" />

            {/* Step 2: API */}
            <div className="md:col-span-2">
              <Server className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="font-semibold text-gray-900">Fastify API</p>
              <p className="text-xs text-gray-600">
                Ingests, validates, and anonymizes data. Handles auth and serves
                stats.
              </p>
            </div>
            <ArrowRight className="w-6 h-6 mx-auto text-gray-400 hidden md:block" />

            {/* Step 3: Database */}
            <div className="md:col-span-2">
              <Database className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="font-semibold text-gray-900">PostgreSQL DB</p>
              <p className="text-xs text-gray-600">
                Stores all anonymized event, user, and site data.
              </p>
            </div>
          </div>
        </div>

        {/* --- Key Design Decisions --- */}
        <h3 className="text-xl font-semibold text-gray-900 mt-10 mb-6">
          Key Design Decisions
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-stone-200 rounded-lg p-6">
            <ShieldCheck className="w-7 h-7 text-green-600 mb-3" />
            <h5 className="font-semibold text-gray-900 mb-2">
              Privacy by Design
            </h5>
            <p className="text-gray-600 text-sm">
              No cookies or PII stored. Visitor identification uses a
              non-reversible hash, ensuring compliance and respecting user
              privacy.
            </p>
          </div>
          <div className="border border-stone-200 rounded-lg p-6">
            <Home className="w-7 h-7 text-blue-600 mb-3" />
            <h5 className="font-semibold text-gray-900 mb-2">
              Self-Hosted First
            </h5>
            <p className="text-gray-600 text-sm">
              Gives you complete data ownership and control. The entire stack is
              open-source and runs on your infrastructure.
            </p>
          </div>
          <div className="border border-stone-200 rounded-lg p-6">
            <Zap className="w-7 h-7 text-amber-600 mb-3" />
            <h5 className="font-semibold text-gray-900 mb-2">
              Performance Optimized
            </h5>
            <p className="text-gray-600 text-sm">
              The tracking script is sub-1KB, and the API and database queries
              are designed for high throughput and low latency.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Architecture;
