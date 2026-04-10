import React from "react";
import { Navigate } from "react-router";

import { Loading } from "@/components/shared/Loading";
import { useIsAdmin } from "@/hooks/use-is-admin";
import useCurrentUser from "@/store/useCurrentUser";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useCurrentUser((state) => state.currentUser);
  const { isAdmin, isLoading } = useIsAdmin();

  if (!currentUser) return <Navigate to="/register" replace />;

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100svh-64px)] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
