"use client";

import { useCurrentUser } from "@/components/account/CurrentUserContext";

export function AccountSummary() {
  const { name, role, trustedLender } = useCurrentUser();
  const isAdmin = role === "admin";
  const isNeighbor = !isAdmin && !trustedLender;

  return (
    <div className="hidden text-right leading-tight sm:block">
      <p className="text-sm font-medium">{name}</p>

      <p className="text-xs whitespace-nowrap text-muted-foreground">
        {isAdmin && "Admin"}
        {isAdmin && trustedLender && ", "}

        {trustedLender && (
          <span className="text-emerald-700">
            {isAdmin ? "trusted lender" : "Trusted lender"}
          </span>
        )}

        {isNeighbor && "Neighbor"}
      </p>
    </div>
  );
}
