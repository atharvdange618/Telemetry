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
      <h2 className="text-3xl font-bold text-foreground mb-6">
        Privacy & Security
      </h2>
      <div className="bg-card rounded-lg border border-border p-8">
        <p className="text-muted-foreground mb-10 text-lg">
          Privacy and security are fundamental to Telemetry's design. Every
          decision prioritizes user privacy while maintaining analytical value.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ShieldOff className="w-6 h-6 text-muted-foreground" />
              <h4 className="font-semibold text-foreground text-lg">
                Privacy Features
              </h4>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Cookie className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">No cookies or localStorage used.</span>
              </li>
              <li className="flex items-start gap-3">
                <Fingerprint className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Anonymous visitor identification.</span>
              </li>
              <li className="flex items-start gap-3">
                <ServerOff className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">IP addresses are never stored.</span>
              </li>
              <li className="flex items-start gap-3">
                <FileCheck2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">GDPR & CCPA compliant by design.</span>
              </li>
              <li className="flex items-start gap-3">
                <Home className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Self-hosted for complete data ownership.</span>
              </li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-muted-foreground" />
              <h4 className="font-semibold text-foreground text-lg">
                Security Measures
              </h4>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Github className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Authentication via GitHub OAuth2.</span>
              </li>
              <li className="flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Signed, httpOnly session cookies.</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Input validation with Zod schemas.</span>
              </li>
              <li className="flex items-start gap-3">
                <DatabaseZap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">SQL injection protection via Prisma.</span>
              </li>
              <li className="flex items-start gap-3">
                <Gauge className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Rate limiting on key API endpoints.</span>
              </li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-6">
          How Visitor Identification Works
        </h3>
        <div className="bg-muted border border-border rounded-lg p-6 mb-10">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-card border border-border rounded-full p-3 mb-3">
                <DownloadCloud className="w-7 h-7 text-muted-foreground" />
              </div>
              <h5 className="font-semibold text-foreground">
                1. Data Collection
              </h5>
              <p className="text-muted-foreground text-sm">
                Server receives the visitor's IP and User-Agent from request
                headers.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-card border border-border rounded-full p-3 mb-3">
                <Hash className="w-7 h-7 text-muted-foreground" />
              </div>
              <h5 className="font-semibold text-foreground">2. Hashing</h5>
              <p className="text-muted-foreground text-sm">
                A SHA-256 hash is generated from:{" "}
                <strong>IP + User-Agent + Tenant ID + Server Salt</strong>.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-card border border-border rounded-full p-3 mb-3">
                <Archive className="w-7 h-7 text-muted-foreground" />
              </div>
              <h5 className="font-semibold text-foreground">3. Storage</h5>
              <p className="text-muted-foreground text-sm">
                Only the resulting hash is stored as the `visitorId`. The
                original IP is immediately discarded.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-muted-foreground" />
              <h4 className="font-semibold text-foreground text-lg">
                Compliance
              </h4>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h5 className="font-medium text-green-600 dark:text-green-400 mb-2">GDPR & CCPA</h5>
              <p className="text-green-600/80 dark:text-green-300/80 text-sm">
                By not collecting personal data and not using cookies, Telemetry
                helps you comply with privacy regulations without needing
                consent banners.
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ClipboardCheck className="w-6 h-6 text-muted-foreground" />
              <h4 className="font-semibold text-foreground text-lg">
                Self-Hosting Best Practices
              </h4>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <ul className="text-amber-600/80 dark:text-amber-300/80 text-sm space-y-2 list-disc list-inside">
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
