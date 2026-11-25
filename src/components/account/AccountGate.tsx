"use client";

import { LoadingState } from "@/components/shared/LoadingState";
import { useUserSync } from "@/hooks/useUserSync";
import { api } from "@convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { CurrentUserContext } from "./CurrentUserContext";
import { SessionEnded } from "./SessionEnded";
import { SuspendedNotice } from "./SuspendedNotice";
import type { AccountGateProps } from "@/types";

export function AccountGate({ children }: AccountGateProps) {
  const { isLoading, isAuthenticated } = useConvexAuth();

  useUserSync(isAuthenticated);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip",
  );

  if (!isLoading && !isAuthenticated) return <SessionEnded />;

  if (!currentUser) {
    return (
      <LoadingState fullScreen label="Loading your neighborhood board..." />
    );
  }

  if (currentUser.suspended) return <SuspendedNotice />;

  return (
    <CurrentUserContext.Provider value={currentUser}>
      {children}
    </CurrentUserContext.Provider>
  );
}
