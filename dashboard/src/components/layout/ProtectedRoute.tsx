import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "@/hooks/useMe";
import { useAuthStore } from "@/lib/state/auth";

export const ProtectedRoute: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { data, isLoading } = useMe();

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
