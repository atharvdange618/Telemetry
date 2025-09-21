import { useScrollSpy } from "@/hooks/useScrollSpy";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function OnPageNavigation() {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const headingElements = Array.from(
      document.querySelectorAll(".prose h2, .prose h3")
    ) as HTMLElement[];

    const newHeadings = headingElements.map((el) => ({
      id: el.id,
      text: el.innerText,
      level: Number(el.tagName.substring(1)),
    }));
    setHeadings(newHeadings);
  }, []);

  const activeId = useScrollSpy(
    headings.map((h) => h.id),
    { rootMargin: "0% 0% -75% 0%" }
  );

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="sticky top-8 w-64">
      <h3 className="font-semibold text-gray-900 mb-2">On This Page</h3>
      <ul className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              onClick={() => scrollToSection(heading.id)}
              className={cn(
                "w-full text-left text-sm transition-colors",
                heading.level === 3 && "pl-4",
                activeId === heading.id
                  ? "text-sky-600 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
