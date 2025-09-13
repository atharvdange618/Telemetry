import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Github,
  Shield,
  Eye,
  Database,
  BarChart3,
  Heart,
  Sparkles,
  ArrowRight,
  Play,
} from "lucide-react";
import { useState, useEffect } from "react";

const FloatingCard = ({
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

const GradientText = ({
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

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogin = () => {
    window.location.href = "http://localhost:3000/login/github";
  };

  const handleDemo = () => {
    document
      .getElementById("demo-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background text-foreground">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingCard delay={0}>
          <div className="absolute top-24 left-20 w-40 h-20 bg-gradient-to-r from-chart-2/15 to-primary/15 rounded-lg backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground text-sm font-medium">
            Privacy First
          </div>
        </FloatingCard>

        <FloatingCard delay={1.5}>
          <div className="absolute top-40 right-24 w-44 h-20 bg-gradient-to-r from-primary/15 to-chart-4/15 rounded-lg backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground text-sm font-medium">
            Open Source
          </div>
        </FloatingCard>

        <FloatingCard delay={3}>
          <div className="absolute bottom-32 left-32 w-44 h-20 bg-gradient-to-r from-chart-3/15 to-accent/15 rounded-lg backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground text-sm font-medium">
            You Own Your Data
          </div>
        </FloatingCard>
      </div>

      <div className="container mx-auto text-center relative z-10 px-6">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Badge className="mb-6 bg-gradient-to-r from-primary to-chart-2 text-primary-foreground border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Open Source Analytics
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-foreground leading-tight">
            Analytics with a{" "}
            <GradientText className="animate-pulse">Soul</GradientText>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
            Gain meaningful insights into your work’s reach and impact while{" "}
            <span className="text-primary font-medium">
              respecting your visitors
            </span>{" "}
            as people — not just data points.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleLogin}
              className="bg-primary text-primary-foreground hover:bg-primary/90 border-0 px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 group"
            >
              <Github className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Start for Free
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleDemo}
              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground px-8 py-6 text-lg backdrop-blur-sm group"
            >
              <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              See Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GuidingPrinciples = () => {
  return (
    <section className="bg-[#F5EDE1] py-20 px-8">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold text-[#3A3A3A]">
          Our Guiding Principles
        </h2>
        <p className="mt-4 text-lg text-[#555555]">
          Built with care, rooted in values. Here’s what drives Telemetry.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Privacy Card */}
        <div
          className="bg-white border border-[#A8BCA1]/30 rounded-xl p-8 shadow-sm text-left
    transition-all duration-300 ease-in-out
    hover:-translate-y-1 hover:shadow-lg hover:border-[#A8BCA1]/60"
        >
          <div className="text-[#C87F5C] text-3xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-[#3A3A3A] mb-2">
            Privacy is Paramount
          </h3>
          <p className="text-[#555555]">
            Cookieless by design. We don’t track individuals across the web or
            collect unnecessary personal data.
          </p>
        </div>

        {/* Clarity Card */}
        <div
          className="bg-white border border-[#A8BCA1]/30 rounded-xl p-8 shadow-sm text-left
    transition-all duration-300 ease-in-out
    hover:-translate-y-1 hover:shadow-lg hover:border-[#A8BCA1]/60"
        >
          <div className="text-[#C87F5C] text-3xl mb-4">✨</div>
          <h3 className="text-xl font-semibold text-[#3A3A3A] mb-2">
            Clarity Over Clutter
          </h3>
          <p className="text-[#555555]">
            No vanity metrics, no dashboard chaos. Just the insights you need,
            at a glance.
          </p>
        </div>

        {/* Data Ownership Card */}
        <div
          className="bg-white border border-[#A8BCA1]/30 rounded-xl p-8 shadow-sm text-left
    transition-all duration-300 ease-in-out
    hover:-translate-y-1 hover:shadow-lg hover:border-[#A8BCA1]/60"
        >
          <div className="text-[#C87F5C] text-3xl mb-4">🗂️</div>
          <h3 className="text-xl font-semibold text-[#3A3A3A] mb-2">
            You Own Your Data
          </h3>
          <p className="text-[#555555]">
            Open-source and self-hosted. Your analytics live on your
            infrastructure, under your control.
          </p>
        </div>

        {/* Passion Card */}
        <div
          className="bg-white border border-[#A8BCA1]/30 rounded-xl p-8 shadow-sm text-left
    transition-all duration-300 ease-in-out
    hover:-translate-y-1 hover:shadow-lg hover:border-[#A8BCA1]/60"
        >
          <div className="text-[#C87F5C] text-3xl mb-4">❤️</div>
          <h3 className="text-xl font-semibold text-[#3A3A3A] mb-2">
            Built with Passion
          </h3>
          <p className="text-[#555555]">
            Crafted with modern tools and a love for clean, mindful software.
            Made for creators, by creators.
          </p>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Privacy First",
      description:
        "Cookieless by design. We don't track individuals across the web or collect non-essential personal data.",
      color: "from-chart-2 to-chart-3",
    },
    {
      icon: Eye,
      title: "Clarity Over Clutter",
      description:
        "Focus on what truly matters: page views, unique visitors, and bounce rates in a clean, intuitive interface.",
      color: "from-chart-1 to-primary",
    },
    {
      icon: Database,
      title: "You Own Your Data",
      description:
        "Open-source and self-hosted. Your website's data belongs to you and sits on your infrastructure.",
      color: "from-primary to-chart-4",
    },
  ];

  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-accent text-accent-foreground border-border">
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Built for the <GradientText>Modern Web</GradientText>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Every feature is designed with privacy, simplicity, and ownership in
            mind.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 shadow-lg bg-card/80 backdrop-blur-sm"
            >
              <CardContent className="p-8 text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => (
  <section id="demo-section" className="py-24 bg-[#F5EDE1]">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
          Getting Started
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
          <GradientText>One Line</GradientText> of Code
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Get powerful analytics up and running in under 60 seconds. No complex
          setup, no cookies, no tracking.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="bg-popover border-border shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-muted/50 px-6 py-4 flex items-center gap-3 border-b border-border">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <div className="w-3 h-3 bg-chart-5 rounded-full"></div>
                <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
              </div>
              <span className="text-muted-foreground text-sm font-medium">
                index.html
              </span>
            </div>
            <div className="p-6">
              <pre className="text-left text-sm text-foreground overflow-x-auto">
                <code>
                  <span className="text-muted-foreground">
                    &lt;!-- Add this single line to your website --&gt;
                  </span>
                  {"\n"}
                  <span className="text-primary">&lt;script</span>{" "}
                  <span className="text-chart-2">async defer</span>{" "}
                  <span className="text-chart-3">src</span>=
                  <span className="text-chart-5">
                    "http://localhost:3000/analytics.js"
                  </span>{" "}
                  <span className="text-chart-3">data-tenant-id</span>=
                  <span className="text-chart-5">"YOUR_TENANT_ID"</span>
                  <span className="text-primary">&gt;&lt;/script&gt;</span>
                </code>
              </pre>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Badge className="bg-accent text-accent-foreground border-border px-4 py-2">
            ✨ That's it! You're now tracking privacy-friendly analytics
          </Badge>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-12 bg-card text-muted-foreground">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-chart-2 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Telemetry</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/atharvdange618/Telemetry"
            className="flex items-center gap-2 hover:text-foreground transition-colors group"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
            View on GitHub
          </a>
          <div className="text-sm">
            &copy; 2025 Telemetry. Built with{" "}
            <Heart className="w-4 h-4 inline text-destructive" /> for the web.
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="bg-background overflow-x-hidden">
      <HeroSection />
      <GuidingPrinciples />
      <FeaturesSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
}
