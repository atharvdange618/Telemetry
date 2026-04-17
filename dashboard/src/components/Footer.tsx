import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-bg p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <Link to="/" className="text-xl font-bold">
              Telemetry
            </Link>
          </div>

          <div className="flex justify-center space-x-8">
            <a
              href="https://github.com/atharvdange618/Telemetry"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <Link
              to="/docs"
              className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors"
            >
              Documentation
            </Link>
          </div>

          <div className="text-center md:text-right text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Telemetry. Built with ❤️ for a better
            web.
          </div>
        </div>
      </div>
    </footer>
  );
}
