import { Check, X } from "lucide-react";

const features = [
  { name: "Cookie-free", telemetry: true, analytics: false },
  { name: "Data Ownership", telemetry: true, analytics: false },
  { name: "GDPR by Default", telemetry: true, analytics: false },
  { name: "Open Source", telemetry: true, analytics: false },
  { name: "Self-Hosted Option", telemetry: true, analytics: false },
  { name: "Real-Time Data", telemetry: true, analytics: true },
  { name: "Lightweight Script", telemetry: true, analytics: false },
  { name: "Built-in Bot Filtering", telemetry: true, analytics: false },
  { name: "API Key Authentication", telemetry: true, analytics: false },
  { name: "No Data Retention Limit", telemetry: true, analytics: false },
];

export function ComparisonSection() {
  return (
    <section className="py-24 px-6 lg:px-8 border-t border-border/50">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4 text-balance text-center">
          Telemetry vs. Google Analytics
        </h2>
        <p className="text-muted-foreground text-lg mb-12 text-center max-w-xl mx-auto">
          See how privacy-first analytics compares.
        </p>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground border-b border-border">
            <div className="px-6 py-4">Feature</div>
            <div className="px-6 py-4 text-center text-primary">Telemetry</div>
            <div className="px-6 py-4 text-center">Google Analytics</div>
          </div>
          {features.map((f, i) => (
            <div
              key={f.name}
              className={`grid grid-cols-3 text-sm ${
                i < features.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              <div className="px-6 py-3.5 text-foreground">{f.name}</div>
              <div className="px-6 py-3.5 flex justify-center">
                {f.telemetry ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500/60" />
                )}
              </div>
              <div className="px-6 py-3.5 flex justify-center">
                {f.analytics ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500/60" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
