import { DocsHeader } from "@/components/Docs/DocsHeader";
import { DocsContent } from "@/components/DocsContent";
import { DocsNavigation } from "@/components/DocsNavigation";
import { Footer } from "@/components/Footer";
import { Menu } from "lucide-react";
import { useState } from "react";
import { SEO } from "@/components/SEO";

export default function DocsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const docsSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "Telemetry Documentation",
    "description": "Learn how to deploy, configure, integrate the tracking script, and set up custom goals on Telemetry.",
    "inLanguage": "en",
    "publisher": {
      "@type": "Organization",
      "name": "Telemetry",
      "logo": `${window.location.origin}/logo.svg`
    }
  };

  return (
    <>
      <SEO
        title="Documentation | Integration & Self-Hosting Guide"
        description="Comprehensive guides for setting up and running Telemetry. Learn how to embed the tracking script, track SPA route changes, monitor custom conversion goals, and self-host the analytics stack."
        keywords="telemetry documentation, web tracking guide, self-hosting analytics, analytics integration, custom goal tracking"
        canonicalPath="/docs"
        schema={docsSchema}
      />
      <div className="bg-stone-50 dark:bg-gray-950 min-h-screen">
        <DocsHeader />

        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center gap-2 rounded-md border border-border p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu />
              Menu
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="lg:hidden mb-4">
              <DocsNavigation />
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:gap-8">
            <div className="hidden w-64 flex-shrink-0 lg:block">
              <DocsNavigation />
            </div>

            <div className="flex-1 max-w-7xl">
              <DocsContent />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
