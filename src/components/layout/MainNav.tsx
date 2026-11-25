"use client";

import { useCurrentUser } from "@/components/account/CurrentUserContext";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/lib/routes";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { NavLink } from "./NavLink";

export function MainNav() {
  const { role } = useCurrentUser();
  const pendingCount = useQuery(api.loans.countPendingIncoming) ?? 0;

  return (
    <nav
      aria-label="Main"
      className="mx-auto flex max-w-7xl gap-5 overflow-x-auto border-t px-4 sm:px-6"
    >
      <NavLink href={ROUTES.browse}>Browse Tools</NavLink>
      <NavLink href={ROUTES.listings}>My Listings</NavLink>
      <NavLink href={ROUTES.requests}>My Requests</NavLink>

      <NavLink href={ROUTES.incoming}>
        Incoming Requests
        {pendingCount > 0 && (
          <Badge
            key={pendingCount}
            tone="count"
            className="animate-in duration-200 zoom-in-50 motion-reduce:animate-none"
          >
            {pendingCount}
            <span className="sr-only"> pending</span>
          </Badge>
        )}
      </NavLink>

      {role === "admin" && <NavLink href={ROUTES.admin}>Admin</NavLink>}
    </nav>
  );
}
