import React from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { dashboardPath } from "@/lib/dashboard-params";

// /dashboard/:siteId on its own, or unknown page slugs, open Overview, keeping
// range and filters.
export const ToOverview: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const { search } = useLocation();

  if (!siteId) {
    return <Navigate to={`/dashboard${search}`} replace />;
  }

  return <Navigate to={dashboardPath(siteId, "overview", search)} replace />;
};
