import type { Id } from "@convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { RemoveListingButton } from "@/components/listings/RemoveListingButton";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface AdminRemovePanelProps {
  toolId: Id<"tools">;
  toolName: string;
}

export function AdminRemovePanel({ toolId, toolName }: AdminRemovePanelProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-2xl border px-5 py-4 text-sm",
        "border-rose-100 bg-rose-50/60 text-stone-700",
      )}
    >
      <span>Admin: remove this listing for everyone.</span>

      <RemoveListingButton
        toolId={toolId}
        toolName={toolName}
        asAdmin
        onRemoved={() => router.push(ROUTES.browse)}
      />
    </div>
  );
}
