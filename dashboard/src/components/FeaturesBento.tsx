import { Shield, BarChart3, Code, Zap, Bot } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "No cookies, no raw IPs",
    description: "The script sets no cookies. Each visitor is counted by a salted hash of IP, browser, and site, the salt rotates every quarter, and the raw IP never reaches the database.",
    large: true,
  },
  {
    icon: BarChart3,
    title: "No Batch Delay",
    description: "Every stat reads raw events when you open the dashboard. A visit from a minute ago is already counted.",
  },
  {
    icon: Zap,
    title: "About 3KB Gzipped",
    description: "One small script. Events go out as keepalive requests with no cookies, so sending them never blocks the page.",
  },
  {
    icon: Code,
    title: "Open Source, Self-Hostable",
    description: "Read the code, run it on your own server, and query the Postgres tables directly.",
  },
  {
    icon: Bot,
    title: "AI Agent Friendly",
    description: "Machine-readable integration guide at /docs.md. AI agents can fetch this file to automatically generate correct telemetry implementations.",
    link: "https://usetelemetry.hogyoku.cloud/docs.md",
  },
];

export function FeaturesBento() {
  return (
    <section id="features" className="py-24 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 text-balance">
            What it tracks, and what it leaves out
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Every number on the dashboard comes from a hashed visitor ID, never a cookie or a raw IP.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group relative rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-foreground/20 ${
                feature.large ? "lg:col-span-2" : ""
              }`}
            >
              <div className="inline-flex p-2.5 rounded-xl bg-primary/5 mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              {"link" in feature && feature.link && (
                <a
                  href={feature.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  View docs.md
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
