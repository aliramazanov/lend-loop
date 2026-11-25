import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";

export function useUserSync(isAuthenticated: boolean) {
  const syncCurrentUser = useMutation(api.users.syncCurrentUser);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || hasSynced.current) return;

    hasSynced.current = true;

    syncCurrentUser().catch((error: unknown) =>
      console.error("User sync failed:", error),
    );
  }, [isAuthenticated, syncCurrentUser]);
}
