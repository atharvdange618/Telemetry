import { cn } from "@/lib/utils";
import { useScrollSpy } from "@/hooks/useScrollSpy";

const sections = [
  {
    title: "Getting Started",
    items: [
      { id: "introduction", title: "Introduction" },
      { id: "installation", title: "Installation" },
      { id: "tracking-script", title: "Tracking Script" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { id: "tracking-endpoint", title: "Tracking Endpoint" },
      { id: "authentication", title: "Authentication" },
      { id: "statistics", title: "Statistics API" },
    ],
  },
  {
    title: "Dashboard",
    items: [
      { id: "overview", title: "Dashboard Overview" },
      { id: "metrics", title: "Key Metrics" },
      { id: "settings", title: "Site Settings" },
    ],
  },
  {
    title: "Technical Details",
    items: [
      { id: "architecture", title: "Architecture" },
      { id: "database", title: "Database Schema" },
      { id: "privacy", title: "Privacy & Security" },
    ],
  },
];

const sectionIds = sections.flatMap((section) =>
  section.items.map((item) => item.id)
);
export function DocsNavigation() {
  const activeSection = useScrollSpy(sectionIds, {
    rootMargin: "0% 0% -80% 0%",
  });

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="sticky top-8">
      <div className="bg-white rounded-lg border border-stone-200 p-4">
        {sections.map((section) => (
          <div key={section.title} className="mb-6 last:mb-0">
            <h3 className="font-semibold text-gray-900 mb-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                      activeSection === item.id
                        ? "bg-gray-100 text-gray-800 font-medium"
                        : "text-gray-600 hover:text-gray-900 hover:bg-stone-50"
                    )}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
