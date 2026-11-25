import { ActionButton } from "@/components/shared/ActionButton";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { RotateCcw } from "lucide-react";
import { useId } from "react";
import type { RemovedListing, RemovedListingsProps } from "@/types";

function removedLabel({ ownerName, archivedAt }: RemovedListing): string {
  const removedOn = formatDate(archivedAt);

  return ownerName
    ? `${ownerName}, removed ${removedOn}`
    : `Removed ${removedOn}`;
}

export function RemovedListings({ title, listings }: RemovedListingsProps) {
  const headingId = useId();
  const restoreTool = useMutation(api.tools.restore);

  if (listings.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="mt-8">
      <SectionHeading id={headingId} className="mb-3">
        {title}
      </SectionHeading>

      <ul className="space-y-2">
        {listings.map((listing) => (
          <li
            key={listing._id}
            className={cn(
              "flex items-center justify-between rounded-xl px-4 py-3",
              "border border-dashed border-input bg-card",
            )}
          >
            <div>
              <span className="font-medium text-stone-700">{listing.name}</span>
              <p className="text-xs text-muted-foreground">
                {removedLabel(listing)}
              </p>
            </div>

            <ActionButton
              variant="outline"
              size="sm"
              aria-label={`Restore ${listing.name}`}
              action={() => restoreTool({ toolId: listing._id })}
              successMessage="Listing restored."
            >
              <RotateCcw aria-hidden />
              Restore
            </ActionButton>
          </li>
        ))}
      </ul>
    </section>
  );
}
