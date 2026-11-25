"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { EventsTable } from "./EventsTable";

export function AutomationFailures() {
  const failures = useQuery(api.n8n.listWorkflowFailuresForAdmin) ?? [];

  if (failures.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No failed n8n workflow runs reported.
      </p>
    );
  }

  return (
    <EventsTable
      heading="Failure"
      emptyText="No failures."
      events={failures}
      summaryClassName="text-rose-800"
    />
  );
}
