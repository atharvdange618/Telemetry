import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Github, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { DarkModeToggle } from "./DarkModeToggle";
import { Button } from "./ui/button";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        className={cn(
          "fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isScrolled
            ? "top-4 w-[calc(100%-2rem)] max-w-3xl glass-strong rounded-full px-4 py-2"
            : "top-6 w-[calc(100%-3rem)] max-w-5xl px-6 py-3",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 flex items-center justify-center">
              <img src="/logo.svg" alt="Telemetry" className="h-5 w-5" />
            </div>
            <Link
              to="/"
              className="text-base font-semibold text-foreground tracking-tight"
            >
              Telemetry
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <a
              href="#features"
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
            >
              How it Works
            </a>
            <a
              href="#faq"
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
            >
              FAQ
            </a>

            <div className="w-px h-4 bg-border mx-1" />

            <DarkModeToggle />
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <Button
                size="sm"
                asChild
                className="cursor-pointer rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm h-9 px-4"
              >
                <a href={`${import.meta.env.VITE_API_URL}/login/github`}>
                  <Github className="h-3.5 w-3.5 mr-1.5" />
                  Sign in
                </a>
              </Button>
            </div>

            <button
              className="md:hidden p-1.5 text-foreground hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 left-0 right-0 glass-strong border-b border-border px-6 pt-24 pb-6">
            <div className="flex flex-col gap-1">
              <a
                href="#features"
                className="text-lg text-foreground py-3 border-b border-border/50"
                onClick={() => setMobileOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-lg text-foreground py-3 border-b border-border/50"
                onClick={() => setMobileOpen(false)}
              >
                How it Works
              </a>
              <a
                href="#faq"
                className="text-lg text-foreground py-3 border-b border-border/50"
                onClick={() => setMobileOpen(false)}
              >
                FAQ
              </a>
              <div className="flex items-center justify-between pt-4">
                <DarkModeToggle />
                <Button
                  asChild
                  className="cursor-pointer rounded-full bg-primary text-primary-foreground"
                >
                  <a href={`${import.meta.env.VITE_API_URL}/login/github`}>
                    <Github className="h-4 w-4 mr-2" />
                    Sign in with GitHub
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
