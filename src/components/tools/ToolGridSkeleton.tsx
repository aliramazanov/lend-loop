import { cn } from "@/lib/utils";
import { BOARD } from "@/lib/config";

const pulse = "animate-pulse bg-muted motion-reduce:animate-none";

export const toolGridClasses =
  "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export function ToolGridSkeleton() {
  return (
    <ul aria-busy="true" aria-label="Loading tools" className={toolGridClasses}>
      {Array.from({ length: BOARD.skeletonCards }, (_, index) => (
        <li key={index} className="overflow-hidden rounded-xl border bg-card">
          <div className={cn("aspect-[4/3]", pulse)} />

          <div className="space-y-2 p-3">
            <div className={cn("h-4 w-2/3 rounded", pulse)} />
            <div className={cn("h-3 w-1/2 rounded", pulse)} />
          </div>
        </li>
      ))}
    </ul>
  );
}
