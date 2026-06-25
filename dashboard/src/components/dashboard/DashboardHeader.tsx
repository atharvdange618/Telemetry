import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronsUpDown,
  Settings,
  LogOut,
  Download,
  Filter,
} from "lucide-react";
import type { TenantsResponse } from "@/lib/types/dashboard.types";

type Segments = {
  browser?: string;
  os?: string;
  country?: string;
  language?: string;
  device?: "mobile" | "tablet" | "desktop";
};

interface DashboardHeaderProps {
  user: { name?: string | null; email?: string | null; image?: string | null } | null;
  tenantsData: TenantsResponse | undefined;
  isLoadingTenants: boolean;
  selectedTenantId: string | null;
  selectedTenant: { id: string; name: string } | undefined;
  period: string;
  customRange: boolean;
  showFilters: boolean;
  hasActiveFilters: boolean;
  onSelectTenant: (id: string) => void;
  onSetPeriod: (p: string) => void;
  onToggleCustomRange: () => void;
  onToggleFilters: () => void;
  onExport: (format: "csv" | "json") => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export function DashboardHeader({
  user,
  tenantsData,
  isLoadingTenants,
  selectedTenant,
  period,
  customRange,
  showFilters,
  hasActiveFilters,
  onSelectTenant,
  onSetPeriod,
  onToggleCustomRange,
  onToggleFilters,
  onExport,
  onNavigate,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/10">
          <img src="/logo.svg" alt="Telemetry" className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate font-heading">
            {isLoadingTenants
              ? "Loading..."
              : selectedTenant?.name || "Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground">Analytics overview</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              {isLoadingTenants
                ? "Loading Sites..."
                : selectedTenant?.name || "Select a Site"}
              <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Your Sites</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {tenantsData?.tenants.map((tenant) => (
              <DropdownMenuItem
                key={tenant.id}
                onSelect={() => onSelectTenant(tenant.id)}
                className={
                  tenant.id === selectedTenant?.id
                    ? "bg-accent"
                    : "cursor-pointer"
                }
              >
                {tenant.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onNavigate("/settings")}>
              <Settings className="h-4 w-4 mr-2" /> Manage Sites
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex rounded-lg border border-border bg-muted/50 p-0.5">
          {(["24h", "7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                onSetPeriod(p);
              }}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                period === p && !customRange
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <Button
          variant={customRange ? "default" : "outline"}
          size="sm"
          onClick={onToggleCustomRange}
        >
          Custom
        </Button>

        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={onToggleFilters}
          className="gap-1"
        >
          <Filter className="h-3.5 w-3.5" />
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onExport("csv")}>
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onExport("json")}>
              Export JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DarkModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-border transition-all">
              <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onNavigate("/settings")}>
              <Settings className="h-4 w-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
