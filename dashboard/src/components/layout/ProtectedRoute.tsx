import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/lib/state/auth";

export const ProtectedRoute: React.FC = () => {
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
    // Signed out is expected here; the route redirects instead.
    meta: { silentError: true },
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
