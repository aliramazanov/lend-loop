"use client";

import { NavLink } from "@/components/layout/NavLink";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/lib/routes";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";

export function AdminNav() {
  const failures = useQuery(api.n8n.listWorkflowFailuresForAdmin) ?? [];

  return (
    <nav
      aria-label="Admin sections"
      className="flex gap-5 overflow-x-auto border-b"
    >
      <NavLink href={ROUTES.admin} exact>
        Overview
      </NavLink>
      <NavLink href={ROUTES.adminNeighbors}>Neighbors</NavLink>
      <NavLink href={ROUTES.adminLoans}>Loans</NavLink>
      <NavLink href={ROUTES.adminRemoved}>Removed listings</NavLink>
      <NavLink href={ROUTES.adminAudit}>Audit log</NavLink>

      <NavLink href={ROUTES.adminAutomation}>
        Automation
        {failures.length > 0 && (
          <Badge tone="danger">
            {failures.length}
            <span className="sr-only"> failures</span>
          </Badge>
        )}
      </NavLink>
    </nav>
  );
}
