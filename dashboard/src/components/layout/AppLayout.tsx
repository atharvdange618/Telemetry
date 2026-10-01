import { useRef } from "react";
import { Outlet, useMatch } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTenants } from "@/hooks/useTenants";
import { AppSidebar } from "./AppSidebar";

export function AppLayout() {
  const { data } = useTenants();
  // useParams in a parent route can't see a child's :siteId, so match it.
  const match = useMatch("/dashboard/:siteId/*");
  // This layout stays mounted between stats pages and /sites, so the ref
  // remembers which site the sidebar links should point at on /sites.
  const lastSiteId = useRef<string | null>(null);
  if (match?.params.siteId) lastSiteId.current = match.params.siteId;
  const activeSiteId = lastSiteId.current ?? data?.tenants[0]?.id ?? null;

  return (
    <SidebarProvider>
      <AppSidebar tenants={data?.tenants ?? []} activeSiteId={activeSiteId} />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
