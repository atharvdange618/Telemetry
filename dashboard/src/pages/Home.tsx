import { ComparisonSection } from "@/components/ComparisonRow";
import { FAQSection } from "@/components/FAQSection";
import { FeaturesBento } from "@/components/FeaturesBento";
import { FinalCtaSection } from "@/components/FinalCtaSection";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { Navigation } from "@/components/Navigation";
import { PrivacyManifestoSection } from "@/components/PrivacyManifestoSection";
import { SEO } from "@/components/SEO";

export default function Home() {
  const homeSchema = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Telemetry",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Privacy-focused, open-source analytics platform. Cookieless by design, self-hosted, one line of code.",
      "softwareVersion": "2.0.0",
      "applicationSubCategory": "Web Analytics"
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Telemetry",
      "url": window.location.origin,
      "logo": `${window.location.origin}/logo.svg`,
      "sameAs": [
        "https://github.com/atharvdange618/Telemetry"
      ]
    }
  ];

  return (
    <main className="min-h-screen">
      <div className="noise" />
      <SEO
        title="Privacy-First Open-Source Web Analytics"
        description="Telemetry is a cookieless, privacy-focused open-source analytics platform. Get clear, aggregated visitor insights without cookie banners, tracking scripts, or personal data collection."
        keywords="analytics, web analytics, privacy-first, cookieless, open source, self-hosted, telemetry, visitor tracking"
        canonicalPath="/"
        schema={homeSchema}
      />
      <Navigation />
      <HeroSection />
      <FeaturesBento />
      <HowItWorksSection />
      <ComparisonSection />
      <PrivacyManifestoSection />
      <FAQSection />
      <FinalCtaSection />
      <Footer />
    </main>
  );
}
