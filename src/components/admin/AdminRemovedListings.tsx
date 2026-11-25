"use client";

import { RemovedListings } from "@/components/listings/RemovedListings";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";

export function AdminRemovedListings() {
  const removed = useQuery(api.tools.listRemovedForAdmin);

  if (removed?.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No removed listings.</p>
    );
  }

  return <RemovedListings title="Removed listings" listings={removed ?? []} />;
}
