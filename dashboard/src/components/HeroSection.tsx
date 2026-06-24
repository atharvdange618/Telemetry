import { Github, BarChart3, Shield, Code, Globe } from "lucide-react";
import { Button } from "./ui/button";

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
  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-stone-50 dark:bg-gray-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-[10%] w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-[10%] w-96 h-96 bg-chart-2/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-chart-3/3 rounded-full blur-3xl" />
      </div>

      <div className="text-center max-w-4xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
          <Shield className="w-4 h-4" />
          Privacy-first analytics
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-stone-900 dark:text-gray-100 mb-6 text-balance tracking-tight">
          Analytics with a{" "}
          <GradientText className="animate-pulse">Soul</GradientText>
        </h1>

        <p className="text-xl md:text-2xl text-stone-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed text-pretty">
          Gain meaningful insights while respecting your visitors as people, not
          just data points. Open source, self-hostable, no cookies.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            asChild
            className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-lg px-8 py-4 h-auto rounded-xl shadow-lg shadow-primary/20"
          >
            <a href={`${API_URL}/login/github`}>
              <Github className="h-5 w-5 mr-2" />
              Get Started
            </a>
          </Button>
          <Button
            size="lg"
            asChild
            variant="outline"
            className="cursor-pointer text-lg px-8 py-4 h-auto rounded-xl border-2 hover:bg-stone-100 dark:hover:bg-gray-800 hover:text-white transition-all"
          >
            <a
              href="https://github.com/atharvdange618/Telemetry"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Code className="h-5 w-5 mr-2" />
              View on GitHub
            </a>
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-8 mt-16 text-sm text-stone-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            No cookies
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            GDPR compliant
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Real-time insights
          </div>
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-primary" />
            Open source
          </div>
        </div>
      </div>
    </section>
  );
}
