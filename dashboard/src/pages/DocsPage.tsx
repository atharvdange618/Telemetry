import { DocsHeader } from "@/components/Docs/DocsHeader";
import { DocsContent } from "@/components/DocsContent";
import { DocsNavigation } from "@/components/DocsNavigation";
import { Footer } from "@/components/Footer";

export default function DocsPage() {
  return (
    <>
      <div className="bg-stone-50">
        <DocsHeader />

        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0">
              <DocsNavigation />
            </div>

            {/* Main Content */}
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
