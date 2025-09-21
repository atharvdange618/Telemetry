import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { GitHubStars } from "./GitHubStars";

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
          ? "bg-white/80 backdrop-blur-md border-b border-gray-200"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-bg p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-gray-900" />
            </div>
            <Link to="/" className="text-xl font-bold text-gray-900">
              Telemetry
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              How it Works
            </a>
            <a
              href="/docs"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Documentation
            </a>
            <GitHubStars repo="atharvdange618/Telemetry" />
          </div>

          {/* CTA Button */}
          {/* <Button
            onClick={() => {
              window.location.href = `${
                import.meta.env.VITE_API_URL
              }/login/github`;
            }}
            className="cursor-pointer gradient-bg text-white hover:opacity-90 transition-opacity"
          >
            <Github className="h-4 w-4 mr-2" />
            Sign in with GitHub
          </Button> */}
        </div>
      </div>
    </nav>
  );
}
