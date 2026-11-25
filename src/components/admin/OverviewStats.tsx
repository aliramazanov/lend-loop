"use client";

import { api } from "@convex/_generated/api";
import { OVERVIEW_WINDOWS } from "@convex/shared/policy";
import { useQuery } from "convex/react";
import { StatTile } from "./StatTile";

export function OverviewStats() {
  const overview = useQuery(api.admin.overview);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatTile
        label="Neighbors"
        value={overview?.neighbors}
        hint={`${overview?.trustedLenders ?? 0} trusted lenders`}
      />
      <StatTile
        label="Active listings"
        value={overview?.activeListings}
        hint={`${overview?.removedListings ?? 0} removed`}
      />
      <StatTile
        label="Tools on loan"
        value={overview?.activeLoans}
        hint={`${overview?.awaitingHandover ?? 0} awaiting handover`}
      />
      <StatTile
        label="Overdue loans"
        value={overview?.overdueLoans}
        hint={`${overview?.escalatedLoans ?? 0} escalated to admins`}
        tone="warning"
      />
      <StatTile
        label="Reported issues"
        value={overview?.reportedIssues}
        hint="Damaged or not returned"
        tone="warning"
      />
      <StatTile
        label="Failed automations"
        value={overview?.failedAutomations7d}
        hint={`Last ${OVERVIEW_WINDOWS.failureWindowDays} days`}
        tone="critical"
      />
    </div>
  );
}
