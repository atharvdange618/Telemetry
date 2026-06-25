import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 flex items-center justify-center">
              <img src="/logo.svg" alt="Telemetry" className="h-5 w-5" />
            </div>
            <Link to="/" className="text-base font-semibold text-foreground tracking-tight">
              Telemetry
            </Link>
          </div>

          <div className="flex justify-center gap-6">
            <a
              href="https://github.com/atharvdange618/Telemetry"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <Link
              to="/docs"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </Link>
          </div>

          <div className="text-center md:text-right text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Telemetry. Built with care for a better web.
          </div>
        </div>
      </div>
    </footer>
  );
}
