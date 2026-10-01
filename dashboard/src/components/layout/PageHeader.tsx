import type { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface PageHeaderProps {
  title: string;
  /** Short status under the title, read out by screen readers. */
  status?: string;
  children?: ReactNode;
}

export function PageHeader({ title, status, children }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="mr-auto min-w-0">
        <h1 className="truncate text-lg font-semibold font-heading">{title}</h1>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {status}
        </p>
      </div>
      {children}
    </header>
  );
}
