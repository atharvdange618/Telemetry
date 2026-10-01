import { AccentText } from "./HeroSection";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6 lg:px-8 border-t border-border/50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 text-balance">
          <AccentText>One Line</AccentText> of Code
        </h2>
        <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
          Add one script tag and events start arriving in under 60 seconds. No
          build step, no cookies.
        </p>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-secondary/30 text-left">
            <span className="text-xs text-muted-foreground font-mono">index.html</span>
          </div>
          <div className="p-5 text-left overflow-x-auto">
            <code className="text-sm md:text-base font-mono text-green-500/90">
              {'<script async defer src="https://usetelemetry.hogyoku.cloud/analytics.js" data-tenant-id="YOUR_TENANT_ID" data-api-key="YOUR_API_KEY"></script>'}
            </code>
          </div>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 text-sm text-green-500/80">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/80" />
          That&rsquo;s it. You&rsquo;re now tracking privacy-friendly analytics.
        </div>
      </div>
    </section>
  );
}
