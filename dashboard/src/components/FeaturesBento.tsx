import { Shield, BarChart3, Globe, Code, Zap, Lock, Bot } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Privacy by Design",
    description: "No cookies, no fingerprinting, no personal data collection. Your visitors stay anonymous while you still get actionable insights.",
    color: "text-primary",
    bg: "bg-primary/5",
    border: "border-primary/10",
    large: true,
  },
  {
    icon: BarChart3,
    title: "Real-Time Dashboard",
    description: "See page views, visitors, and engagement metrics as they happen.",
    color: "text-chart-2",
    bg: "bg-chart-2/5",
    border: "border-chart-2/10",
  },
  {
    icon: Globe,
    title: "Self-Hosted",
    description: "Own your data completely. Run on your infrastructure.",
    color: "text-chart-4",
    bg: "bg-chart-4/5",
    border: "border-chart-4/10",
  },
  {
    icon: Code,
    title: "Open Source",
    description: "Transparent codebase. Audit, contribute, or fork. No vendor lock-in.",
    color: "text-chart-3",
    bg: "bg-chart-3/5",
    border: "border-chart-3/10",
  },
  {
    icon: Zap,
    title: "Under 1KB",
    description: "Lightweight script loads asynchronously. Zero impact on page speed or Core Web Vitals.",
    color: "text-accent",
    bg: "bg-accent/5",
    border: "border-accent/10",
  },
  {
    icon: Lock,
    title: "GDPR Compliant",
    description: "Built for compliance from day one. No cookie banners needed. Works across EU and global regulations.",
    color: "text-chart-5",
    bg: "bg-chart-5/5",
    border: "border-chart-5/10",
    large: true,
  },
  {
    icon: Bot,
    title: "AI Agent Friendly",
    description: "Machine-readable integration guide at /docs.md. AI agents can fetch this file to automatically generate correct telemetry implementations.",
    color: "text-chart-1",
    bg: "bg-chart-1/5",
    border: "border-chart-1/10",
  },
];

export function FeaturesBento() {
  return (
    <section id="features" className="py-24 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 text-balance">
            Built for developers who care about privacy
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Everything you need to understand your audience without compromising their trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-border/20 hover:bg-card/80 ${
                feature.large ? "lg:col-span-2" : ""
              }`}
            >
              <div className={`inline-flex p-2.5 rounded-xl ${feature.bg} ${feature.border} border mb-4`}>
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <h3 className="font-heading text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
