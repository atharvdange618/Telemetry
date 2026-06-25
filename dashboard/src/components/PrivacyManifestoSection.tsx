import { Shield, Heart, Code, Users } from "lucide-react";

const principles = [
  {
    icon: Shield,
    title: "Privacy by Design",
    description: "Every decision starts with protecting visitor privacy. No compromises, no exceptions.",
  },
  {
    icon: Heart,
    title: "Analytics with Soul",
    description: "We believe in understanding your audience without exploiting them. Insights should empower, not invade.",
  },
  {
    icon: Code,
    title: "Transparency Through Code",
    description: "Open source means you can see exactly how your data is collected and processed. No black boxes.",
  },
  {
    icon: Users,
    title: "Community Over Profit",
    description: "Built by developers, for developers. Our success is measured by the trust we earn, not the data we collect.",
  },
];

export function PrivacyManifestoSection() {
  return (
    <section className="py-24 px-6 lg:px-8 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 text-balance">
              A manifesto for ethical analytics
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              We believe the web deserves better. Analytics shouldn&rsquo;t mean surveillance.
              Telemetry exists to prove that meaningful insights and visitor privacy aren&rsquo;t
              mutually exclusive.
            </p>
            <blockquote className="border-l-2 border-primary/40 pl-5 text-muted-foreground italic">
              &ldquo;If you aren&rsquo;t paying for the product, you are the product. Telemetry
              flips that model. You own your data, your infrastructure, and your relationship
              with your audience.&rdquo;
              <footer className="mt-2 text-sm not-italic text-muted-foreground/60">
                &mdash; The Telemetry Team
              </footer>
            </blockquote>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {principles.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-border/20"
              >
                <p.icon className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-heading text-base text-foreground mb-1.5">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
