import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useAuthStore } from "./lib/state/auth";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { StatsLayout } from "./components/layout/StatsLayout";
import { DashboardIndexRedirect } from "./components/layout/DashboardIndexRedirect";
import OverviewPage from "./pages/dashboard/OverviewPage";
import ContentPage from "./pages/dashboard/ContentPage";
import SourcesPage from "./pages/dashboard/SourcesPage";
import AudiencePage from "./pages/dashboard/AudiencePage";
import ConversionsPage from "./pages/dashboard/ConversionsPage";
import PerformancePage from "./pages/dashboard/PerformancePage";
import SharedDashboardPage from "./pages/SharedDashboardPage";
import React from "react";
import SitesPage from "./pages/SitesPage";
import Home from "./pages/Home";
// Applies the saved theme to <html> as soon as the app loads.
import "./hooks/useDarkMode";

import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/sonner";

// Keep the last result on screen while a new period or filter loads, so
// sections don't unmount and the page doesn't jump on every change.
const queryClient = new QueryClient({
  defaultOptions: { queries: { placeholderData: keepPreviousData } },
});

const ProtectedRoute: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL;

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/me`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    },
    retry: false,
  });

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
  }, [data, setUser]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user && !data?.user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// /dashboard/:siteId on its own opens Overview, keeping range and filters.
const ToOverview: React.FC = () => {
  const { search } = useLocation();
  return <Navigate to={{ pathname: "overview", search }} replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/shared/:token",
    element: <SharedDashboardPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/dashboard", element: <DashboardIndexRedirect /> },
      {
        element: <AppLayout />,
        children: [
          {
            path: "/dashboard/:siteId",
            element: <StatsLayout />,
            children: [
              { index: true, element: <ToOverview /> },
              { path: "overview", element: <OverviewPage /> },
              { path: "content", element: <ContentPage /> },
              { path: "sources", element: <SourcesPage /> },
              { path: "audience", element: <AudiencePage /> },
              { path: "conversions", element: <ConversionsPage /> },
              { path: "performance", element: <PerformancePage /> },
              { path: "*", element: <ToOverview /> },
            ],
          },
          { path: "/sites", element: <SitesPage /> },
          { path: "/settings", element: <Navigate to="/sites" replace /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
