import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, Github, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { DarkModeToggle } from "./DarkModeToggle";
import { Button } from "./ui/button";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <div className="p-2 rounded-lg bg-primary/10">
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

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Button
                onClick={() => {
                  window.location.href = `${
                    import.meta.env.VITE_API_URL
                  }/login/github`;
                }}
                className="cursor-pointer bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Github className="h-4 w-4 mr-2" />
                Sign in with GitHub
              </Button>
            </div>

            <button
              className="md:hidden p-2 text-gray-900 dark:text-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 pb-4">
          <div className="flex flex-col space-y-3">
            <a
              href="#features"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 py-2 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 py-2 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              How it Works
            </a>
            <a
              href="/docs"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 py-2 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Documentation
            </a>
            <div className="flex items-center justify-between py-2">
              <DarkModeToggle />
              <Button
                onClick={() => {
                  window.location.href = `${
                    import.meta.env.VITE_API_URL
                  }/login/github`;
                }}
                className="cursor-pointer bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Github className="h-4 w-4 mr-2" />
                Sign in with GitHub
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
