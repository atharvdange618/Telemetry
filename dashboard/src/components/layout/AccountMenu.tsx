import { ChevronsUpDown, LogOut, Moon, Sun } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useDarkMode } from "@/hooks/useDarkMode";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/lib/state/auth";

export function AccountMenu() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const { isDark, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/logout`, { credentials: "include" });
      if (!response.ok) {
        toast.error("Couldn't log out. Try again.");
        return;
      }
      // Drop everything cached for this account, so the landing page asks
      // /me again and the next sign-in never sees this account's data.
      queryClient.clear();
      setUser(null);
      navigate("/", { replace: true });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg" tooltip="Account">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image ?? ""} alt="" />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 text-left leading-tight">
            <span className="truncate text-sm font-medium">{user?.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuItem
          onSelect={(e) => {
            // Keep the menu open so the change is visible.
            e.preventDefault();
            toggleDarkMode();
          }}
        >
          {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
          {isDark ? "Light mode" : "Dark mode"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleLogout}
          variant="destructive"
        >
          <LogOut className="h-4 w-4 mr-2" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
