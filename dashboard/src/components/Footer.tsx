import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 flex items-center justify-center">
              <img src="/logo.svg" alt="Telemetry" className="h-5 w-5" />
            </div>
            <Link to="/" className="text-base font-semibold text-foreground tracking-tight">
              Telemetry
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Product</span>
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

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Legal</span>
            <span className="text-sm text-muted-foreground/50">Privacy Policy</span>
            <span className="text-sm text-muted-foreground/50">Terms of Service</span>
          </div>

          <div className="text-sm text-muted-foreground md:text-right">
            &copy; {new Date().getFullYear()} Telemetry
          </div>
        </div>
      </div>
    </footer>
  );
}
