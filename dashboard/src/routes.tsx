import { Navigate, type RouteObject } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { StatsLayout } from "./components/layout/StatsLayout";
import { DashboardIndexRedirect } from "./components/layout/DashboardIndexRedirect";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { ToOverview } from "./components/layout/ToOverview";
import OverviewPage from "./pages/dashboard/OverviewPage";
import ContentPage from "./pages/dashboard/ContentPage";
import SourcesPage from "./pages/dashboard/SourcesPage";
import AudiencePage from "./pages/dashboard/AudiencePage";
import ConversionsPage from "./pages/dashboard/ConversionsPage";
import PerformancePage from "./pages/dashboard/PerformancePage";
import SharedDashboardPage from "./pages/SharedDashboardPage";
import SitesPage from "./pages/SitesPage";
import Home from "./pages/Home";

// Shared by the app's browser router and the router tests.
export const routes: RouteObject[] = [
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
];
