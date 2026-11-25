"use client";

import { CenteredMessage } from "@/components/shared/CenteredMessage";
import { LoadingState } from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";
import { ToolForm } from "./ToolForm";

export function EditListing({ toolId }: { toolId: string }) {
  const listing = useQuery(api.tools.getMyListing, { toolId });

  if (listing === undefined) return <LoadingState label="Loading listing..." />;

  if (listing === null) {
    return (
      <CenteredMessage title="This listing can't be edited">
        <Button variant="link" asChild>
          <Link href={ROUTES.listings}>Back to My Listings</Link>
        </Button>
      </CenteredMessage>
    );
  }

  return <ToolForm listing={listing} />;
}
