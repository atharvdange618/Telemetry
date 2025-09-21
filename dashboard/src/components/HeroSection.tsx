import { Github } from "lucide-react";
import { Button } from "./ui/button";

export const FloatingCard = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <div
    className="animate-float"
    style={{
      animationDelay: `${delay}s`,
      animationDuration: "6s",
      animationIterationCount: "infinite",
      animationTimingFunction: "ease-in-out",
    }}
  >
    {children}
  </div>
);

export const GradientText = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`bg-gradient-to-r from-primary via-chart-2 to-chart-4 bg-clip-text text-transparent ${className}`}
  >
    {children}
  </span>
);

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-stone-50">
      {/* Background floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingCard delay={0}>
          <div className="absolute top-44 left-44 w-40 h-20 bg-gradient-to-r from-chart-2/15 to-primary/15 rounded-lg backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground text-sm font-medium">
            Privacy First
          </div>
        </FloatingCard>

        <FloatingCard delay={1.5}>
          <div className="absolute top-44 right-44 w-44 h-20 bg-gradient-to-r from-primary/15 to-chart-4/15 rounded-lg backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground text-sm font-medium">
            Open Source
          </div>
        </FloatingCard>

        <FloatingCard delay={3}>
          <div className="absolute bottom-44 left-44 w-44 h-20 bg-gradient-to-r from-chart-3/15 to-accent/15 rounded-lg backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground text-sm font-medium">
            You Own Your Data
          </div>
        </FloatingCard>

        <FloatingCard delay={3}>
          <div className="absolute bottom-44 right-44 w-44 h-20 bg-gradient-to-r from-chart-3/15 to-accent/15 rounded-lg backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground text-sm font-medium">
            Developer Friendly
          </div>
        </FloatingCard>
      </div>

      <div className="text-center max-w-4xl mx-auto relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold text-stone-900 mb-6 text-balance">
          Analytics with a{" "}
          <GradientText className="animate-pulse">Soul</GradientText>
        </h1>

        <p className="text-xl md:text-2xl text-stone-600 mb-12 max-w-3xl mx-auto leading-relaxed text-pretty">
          A privacy-focused, open-source analytics platform. Gain meaningful
          insights while respecting your visitors as people, not just data
          points.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            asChild
            className="cursor-pointer gradient-bg text-white hover:opacity-90 transition-opacity text-lg px-8 py-4"
          >
            <a
              href="mailto:atharvdange.dev@gmail.com?subject=Telemetry%20Beta%20Access%20Request"
              className="inline-flex items-center justify-center rounded-md text-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-8 py-4 cursor-pointer gradient-bg text-white hover:opacity-90"
            >
              <Github className="h-5 w-5 mr-2" />
              Request Early Access
            </a>
          </Button>
          <Button
            size="lg"
            asChild
            className="cursor-pointer gradient-bg text-gray-900 hover:opacity-90 transition-opacity text-lg px-8 py-4"
          >
            <a
              href="https://github.com/atharvdange618/Telemetry"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md text-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-8 py-4 cursor-pointer gradient-bg text-gray-900 hover:text-white hover:opacity-90 bg-transparent border"
            >
              View Source on GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
