import {
  Cookie,
  ShieldOff,
  Fingerprint,
  ServerOff,
  FileCheck2,
  Home,
  Github,
  KeyRound,
  ShieldCheck,
  DatabaseZap,
  Gauge,
  DownloadCloud,
  Hash,
  Archive,
  Scale,
  ClipboardCheck,
} from "lucide-react";

const PrivacyAndSecurity = () => {
  return (
    <section id="privacy" className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Privacy & Security
      </h2>
      <div className="bg-white rounded-lg border border-stone-200 p-8">
        <p className="text-gray-700 mb-10 text-lg">
          Privacy and security are fundamental to Telemetry's design. Every
          decision prioritizes user privacy while maintaining analytical value.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Privacy Features */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ShieldOff className="w-6 h-6 text-gray-500" />
              <h4 className="font-semibold text-gray-900 text-lg">
                Privacy Features
              </h4>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Cookie className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
                No cookies or localStorage used.
              </li>
              <li className="flex items-start gap-3">
                <Fingerprint className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
                Anonymous visitor identification.
              </li>
              <li className="flex items-start gap-3">
                <ServerOff className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
                IP addresses are never stored.
              </li>
              <li className="flex items-start gap-3">
                <FileCheck2 className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
                GDPR & CCPA compliant by design.
              </li>
              <li className="flex items-start gap-3">
                <Home className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
                Self-hosted for complete data ownership.
              </li>
            </ul>
          </div>
          {/* Security Measures */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-gray-500" />
              <h4 className="font-semibold text-gray-900 text-lg">
                Security Measures
              </h4>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Github className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
                Authentication via GitHub OAuth2.
              </li>
              <li className="flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
                Signed, httpOnly session cookies.
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
                Input validation with Zod schemas.
              </li>
              <li className="flex items-start gap-3">
                <DatabaseZap className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
                SQL injection protection via Prisma.
              </li>
              <li className="flex items-start gap-3">
                <Gauge className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
                Rate limiting on key API endpoints.
              </li>
            </ul>
          </div>
        </div>

        {/* --- How Visitor Identification Works --- */}
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          How Visitor Identification Works
        </h3>
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-6 mb-10">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="bg-white border rounded-full p-3 mb-3">
                <DownloadCloud className="w-7 h-7 text-gray-600" />
              </div>
              <h5 className="font-semibold text-gray-900">
                1. Data Collection
              </h5>
              <p className="text-gray-600 text-sm">
                Server receives the visitor's IP and User-Agent from request
                headers.
              </p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="bg-white border rounded-full p-3 mb-3">
                <Hash className="w-7 h-7 text-gray-600" />
              </div>
              <h5 className="font-semibold text-gray-900">2. Hashing</h5>
              <p className="text-gray-600 text-sm">
                A SHA-256 hash is generated from:{" "}
                <strong>IP + User-Agent + Tenant ID + Server Salt</strong>.
              </p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="bg-white border rounded-full p-3 mb-3">
                <Archive className="w-7 h-7 text-gray-600" />
              </div>
              <h5 className="font-semibold text-gray-900">3. Storage</h5>
              <p className="text-gray-600 text-sm">
                Only the resulting hash is stored as the `visitorId`. The
                original IP is immediately discarded.
              </p>
            </div>
          </div>
        </div>

        {/* --- Compliance & Best Practices --- */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-gray-500" />
              <h4 className="font-semibold text-gray-900 text-lg">
                Compliance
              </h4>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-medium text-green-900 mb-2">GDPR & CCPA</h5>
              <p className="text-green-800 text-sm">
                By not collecting personal data and not using cookies, Telemetry
                helps you comply with privacy regulations without needing
                consent banners.
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ClipboardCheck className="w-6 h-6 text-gray-500" />
              <h4 className="font-semibold text-gray-900 text-lg">
                Self-Hosting Best Practices
              </h4>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <ul className="text-amber-800 text-sm space-y-2 list-disc list-inside">
                <li>Regularly update dependencies for security patches.</li>
                <li>Use a firewall to restrict direct database access.</li>
                <li>Monitor application logs for suspicious activity.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyAndSecurity;
