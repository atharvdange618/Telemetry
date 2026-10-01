import { ChevronsUpDown, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import type { Tenant } from "@/lib/types/dashboard.types";

interface SiteSwitcherProps {
  tenants: Tenant[];
  activeSite: Tenant | undefined;
  onSelect: (siteId: string) => void;
}

export function SiteSwitcher({ tenants, activeSite, onSelect }: SiteSwitcherProps) {
  const navigate = useNavigate();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" tooltip="Switch site">
              <img src="/logo.svg" alt="" className="h-6 w-6 shrink-0" />
              <span className="truncate font-semibold">{activeSite?.name ?? "Select a site"}</span>
              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Your sites</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {tenants.map((tenant) => (
              <DropdownMenuItem
                key={tenant.id}
                onSelect={() => onSelect(tenant.id)}
                className={tenant.id === activeSite?.id ? "bg-accent" : undefined}
              >
                {tenant.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate("/sites")}>
              <Plus className="h-4 w-4 mr-2" /> Add site
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
