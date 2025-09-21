import { DocsHeader } from "@/components/Docs/DocsHeader";
import { DocsContent } from "@/components/DocsContent";
import { DocsNavigation } from "@/components/DocsNavigation";
import { Footer } from "@/components/Footer";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function DocsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="bg-stone-50">
        <DocsHeader />

        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center gap-2 rounded-md border p-2 text-stone-600"
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
