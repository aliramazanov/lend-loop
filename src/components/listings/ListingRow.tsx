import { ToolPhoto } from "@/components/tools/ToolPhoto";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { categoryLabel } from "@/lib/categories";
import { editListingRoute, toolRoute } from "@/lib/routes";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { RemoveListingButton } from "./RemoveListingButton";
import type { ListingRowProps } from "@/types";

export function ListingRow({ listing }: ListingRowProps) {
  const [cover] = listing.photos;

  return (
    <Card className="flex items-center gap-4 p-3">
      <ToolPhoto
        name={listing.name}
        category={listing.category}
        photoUrl={cover?.url ?? null}
        className="h-16 w-20 shrink-0 rounded-lg"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={toolRoute(listing._id)}
            className="font-medium hover:underline"
          >
            {listing.name}
          </Link>
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {categoryLabel(listing.category)} ·{" "}
            {listing.isAvailable ? "Available" : "On loan"}
          </span>
        </div>

        <p className="mt-1 truncate text-sm text-stone-600">
          {listing.shortDescription}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon-sm" asChild>
          <Link
            href={editListingRoute(listing._id)}
            aria-label={`Edit ${listing.name}`}
          >
            <Pencil aria-hidden />
          </Link>
        </Button>

        <RemoveListingButton toolId={listing._id} toolName={listing.name} />
      </div>
    </Card>
  );
}
