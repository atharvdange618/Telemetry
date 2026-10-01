import { Github, ArrowRight, Code } from "lucide-react";
import { Button } from "./ui/button";

export const AccentText = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span className={`text-accent ${className}`}>{children}</span>
);

export function HeroSection() {
  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-slide-in-left">
            <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-6 text-balance leading-[1.05]">
              Know which pages work without knowing{" "}
              <AccentText>who read them</AccentText>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-10 leading-relaxed">
              Pages, referrers, goals, funnels, and Core Web Vitals from one
              3KB script. No cookies, open source, self-hostable.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                asChild
                className="cursor-pointer rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all h-12 px-6 text-sm font-medium group"
              >
                <a href={`${API_URL}/login/github`}>
                  <Github className="h-4 w-4 mr-2" />
                  Get Started Free
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                </a>
              </Button>
              <Button
                size="lg"
                asChild
                variant="outline"
                className="cursor-pointer rounded-full h-12 px-6 text-sm font-medium border-border hover:bg-secondary transition-all"
              >
                <a
                  href="https://github.com/atharvdange618/Telemetry"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Code className="h-4 w-4 mr-2" />
                  View Source
                </a>
              </Button>
            </div>
          </div>

          <div className="animate-slide-in-right hidden lg:block">
            <div className="relative">
              <div className="relative rounded-2xl border border-border bg-card p-1">
                <div className="rounded-xl bg-background p-6">
                  <div className="mb-6 text-xs text-muted-foreground font-mono">dashboard</div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Page Views", value: "12,847", change: "+18.2%" },
                      { label: "Unique Visitors", value: "4,291", change: "+12.5%" },
                      { label: "Bounce Rate", value: "32.1%", change: "-4.8%" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg bg-secondary/50 p-3">
                        <div className="text-[10px] text-muted-foreground mb-1">{stat.label}</div>
                        <div className="text-lg font-semibold text-foreground font-mono">{stat.value}</div>
                        <div className="text-[10px] text-green-500 font-mono">{stat.change}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="text-[10px] text-muted-foreground mb-3">Views Over Time</div>
                    <div className="flex items-end gap-1 h-20">
                      {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-primary/60 transition-all"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
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
