import { Card } from "@/components/ui/Card";
import { categoryLabel } from "@/lib/categories";
import type { ToolDetailsView } from "@/lib/convexTypes";
import { ROUTES } from "@/lib/routes";
import { CONDITION_LABELS } from "@convex/shared/catalog";
import Link from "next/link";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { BorrowPanel } from "./BorrowPanel";

export function ToolSummaryCard({ tool }: { tool: ToolDetailsView }) {
  const canBorrow = !tool.isOwner && !tool.isArchived;
  const isOwnActiveListing = tool.isOwner && !tool.isArchived;

  return (
    <Card className="rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{tool.name}</h1>

        <AvailabilityBadge
          isArchived={tool.isArchived}
          isAvailable={tool.isAvailable}
        />
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        {categoryLabel(tool.category)} · {CONDITION_LABELS[tool.condition]}{" "}
        condition
      </p>

      <div className="mt-5 border-t pt-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {canBorrow ? "Choose your dates" : "Availability"}
          </h2>

          <p className="text-xs text-muted-foreground">
            <s
              aria-hidden
              className="mr-1 rounded bg-stone-200 px-1 text-stone-700"
            >
              12
            </s>
            Booked
          </p>
        </div>

        {canBorrow ? (
          <BorrowPanel tool={tool} />
        ) : (
          <AvailabilityCalendar bookedRanges={tool.bookedRanges} />
        )}
      </div>

      {isOwnActiveListing && (
        <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm text-stone-700">
          This is your listing. Edit it from{" "}
          <Link
            href={ROUTES.listings}
            className="font-medium text-primary-hover hover:underline"
          >
            My Listings
          </Link>{" "}
          and answer requests under Incoming Requests.
        </p>
      )}
    </Card>
  );
}
