import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { DarkModeToggle } from "./DarkModeToggle";
import { Button } from "./ui/button";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
          : "bg-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-bg p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-gray-900 dark:text-gray-100" />
            </div>
            <Link
              to="/"
              className="text-xl font-bold text-gray-900 dark:text-gray-100"
            >
              Telemetry
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              How it Works
            </a>
            <a
              href="/docs"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Documentation
            </a>
            <DarkModeToggle />
          </div>

          <Button
            onClick={() => {
              window.location.href = `${
                import.meta.env.VITE_API_URL
              }/login/github`;
            }}
            className="cursor-pointer gradient-bg text-white hover:opacity-90 transition-opacity"
          >
            <Github className="h-4 w-4 mr-2" />
            Sign in with GitHub
          </Button>
        </div>
      </div>
    </nav>
  );
}
