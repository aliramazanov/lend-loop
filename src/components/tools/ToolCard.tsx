import { categoryLabel } from "@/lib/categories";
import { toolRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { CONDITION_LABELS } from "@convex/shared/catalog";
import { Images } from "lucide-react";
import Link from "next/link";
import { ToolPhoto } from "./ToolPhoto";
import type { ToolCardProps } from "@/types";

const cardClasses = cn(
  "group block h-full overflow-hidden rounded-xl border bg-card",
  "transition duration-200 ease-out",
  "hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md",
  "focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]",
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
);

export function ToolCard({ tool }: ToolCardProps) {
  const [coverUrl] = tool.photoUrls;
  const photoCount = tool.photoUrls.length;

  return (
    <Link href={toolRoute(tool._id)} className={cardClasses}>
      <div className="relative overflow-hidden">
        <ToolPhoto
          name={tool.name}
          category={tool.category}
          photoUrl={coverUrl ?? null}
          className="aspect-[4/3] w-full"
        />

        {photoCount > 1 && (
          <span
            className={cn(
              "absolute right-2 bottom-2 inline-flex items-center gap-1",
              "rounded-md px-1.5 py-0.5 text-xs",
              "bg-black/60 text-white",
            )}
          >
            <Images aria-hidden className="size-3" />
            {photoCount}
            <span className="sr-only"> photos</span>
          </span>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate font-medium group-hover:underline">
            {tool.name}
          </h3>

          {!tool.isAvailable && (
            <span className="shrink-0 text-xs font-medium text-amber-700">
              On loan
            </span>
          )}
        </div>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {categoryLabel(tool.category)}
          {" · "}
          {CONDITION_LABELS[tool.condition]}
        </p>

        <p className="mt-2 text-xs text-stone-600">
          {tool.isOwner ? "Your listing" : tool.ownerName}

          {tool.ownerTrustedLender && (
            <>
              , <span className="text-emerald-700">trusted lender</span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
