import type { CurrentUser } from "@/lib/convexTypes";
import { createContext, useContext } from "react";

export const CurrentUserContext = createContext<CurrentUser | null>(null);

export function useCurrentUser(): CurrentUser {
  const user = useContext(CurrentUserContext);

  if (!user) {
    throw new Error("useCurrentUser must be used inside <AccountGate>");
  }

  return user;
}
