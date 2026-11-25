import { createContext, useContext } from "react";
import type { CurrentUser } from "@/types";

export const CurrentUserContext = createContext<CurrentUser | null>(null);

export function useCurrentUser(): CurrentUser {
  const user = useContext(CurrentUserContext);

  if (!user) {
    throw new Error("useCurrentUser must be used inside <AccountGate>");
  }

  return user;
}
