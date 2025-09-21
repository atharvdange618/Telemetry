import { BuiltBySection } from "@/components/BuiltBySection";
import { ComparisonSection } from "@/components/ComparisonRow";
import { DashboardPreviewSection } from "@/components/DashboardPreviewSection";
import { FAQSection } from "@/components/FAQSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { FinalCtaSection } from "@/components/FinalCtaSection";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { Navigation } from "@/components/Navigation";
import { PrivacyManifestoSection } from "@/components/PrivacyManifestoSection";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DashboardPreviewSection />
      <ComparisonSection />
      <PrivacyManifestoSection />
      <FAQSection />
      <BuiltBySection />
      <FinalCtaSection />
      <Footer />
    </main>
  );
}
