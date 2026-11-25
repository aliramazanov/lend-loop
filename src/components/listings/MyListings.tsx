"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ListingRow } from "./ListingRow";
import { RemovedListings } from "./RemovedListings";

export function MyListings() {
  const listings = useQuery(api.tools.listMyListings);
  const removedListings = useQuery(api.tools.listMyRemovedListings) ?? [];

  return (
    <section>
      <PageHeader title="My Listings">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.newListing}>
            <Plus aria-hidden />
            Add tool
          </Link>
        </Button>
      </PageHeader>

      {listings === undefined && (
        <LoadingState label="Loading your listings..." />
      )}

      {listings?.length === 0 && (
        <EmptyState>You haven&apos;t listed any tools yet.</EmptyState>
      )}

      {listings && listings.length > 0 && (
        <ul className="space-y-3">
          {listings.map((listing) => (
            <li key={listing._id}>
              <ListingRow listing={listing} />
            </li>
          ))}
        </ul>
      )}

      <RemovedListings title="Recently removed" listings={removedListings} />
    </section>
  );
}
