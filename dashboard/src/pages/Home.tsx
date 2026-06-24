import { ComparisonSection } from "@/components/ComparisonRow";
import { DashboardPreviewSection } from "@/components/DashboardPreviewSection";
import { FAQSection } from "@/components/FAQSection";
import { FinalCtaSection } from "@/components/FinalCtaSection";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { Navigation } from "@/components/Navigation";
import { PrivacyManifestoSection } from "@/components/PrivacyManifestoSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-background dark:bg-gray-950">
      <Navigation />
      <HeroSection />
      <HowItWorksSection />
      <DashboardPreviewSection />
      <ComparisonSection />
      <PrivacyManifestoSection />
      <FAQSection />
      <FinalCtaSection />
      <Footer />
    </main>
  );
}
