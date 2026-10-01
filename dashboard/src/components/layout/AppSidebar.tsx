import { useEffect } from "react";
import { NavLink, useLocation, useMatch, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { dashboardPath } from "@/lib/dashboard-params";
import { DASHBOARD_PAGES } from "@/lib/dashboard-pages";
import type { Tenant } from "@/lib/types/dashboard.types";
import { AccountMenu } from "./AccountMenu";
import { SiteSwitcher } from "./SiteSwitcher";

interface AppSidebarProps {
  tenants: Tenant[];
  activeSiteId: string | null;
}

export function AppSidebar({ tenants, activeSiteId }: AppSidebarProps) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const statsMatch = useMatch("/dashboard/:siteId/:page");
  const onSitesPage = useMatch("/sites") !== null;
  const { setOpenMobile } = useSidebar();

  // On mobile the sidebar is a sheet; close it once a link has navigated.
  useEffect(() => setOpenMobile(false), [pathname, setOpenMobile]);

  const currentPage = statsMatch?.params.page ?? "overview";
  // Only stats pages carry range and filters in their URL.
  const carriedSearch = statsMatch ? search : "";
  const activeSite = tenants.find((t) => t.id === activeSiteId);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SiteSwitcher
          tenants={tenants}
          activeSite={activeSite}
          onSelect={(id) => navigate(dashboardPath(id, currentPage, carriedSearch))}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarMenu>
            {DASHBOARD_PAGES.map(({ slug, title, icon: Icon }) => (
              <SidebarMenuItem key={slug}>
                <SidebarMenuButton
                  asChild
                  isActive={statsMatch?.params.page === slug}
                  tooltip={title}
                >
                  <NavLink
                    to={activeSiteId ? dashboardPath(activeSiteId, slug, carriedSearch) : "/sites"}
                  >
                    <Icon />
                    <span>{title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={onSitesPage} tooltip="Sites">
              <NavLink to="/sites">
                <Settings />
                <span>Sites</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <AccountMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
