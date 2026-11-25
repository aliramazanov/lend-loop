import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import type { RemoveListingButtonProps } from "@/types";

const COPY = {
  owner: {
    verb: "Delete",
    description:
      "Pending requests for this tool are declined and borrowers are notified. You can restore it later from Recently removed.",
    confirmLabel: "Delete listing",
    successMessage: "Listing deleted.",
  },
  admin: {
    verb: "Remove listing",
    description:
      "The listing disappears for everyone and its pending requests are declined. You can restore it from the Admin area.",
    confirmLabel: "Remove listing",
    successMessage: "Listing removed.",
  },
} as const;

export function RemoveListingButton({
  toolId,
  toolName,
  asAdmin = false,
  onRemoved,
}: RemoveListingButtonProps) {
  const removeTool = useMutation(api.tools.remove);
  const copy = asAdmin ? COPY.admin : COPY.owner;
  const title = asAdmin ? `Remove "${toolName}"?` : `Delete "${toolName}"?`;

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="danger"
          size="icon-sm"
          aria-label={`${copy.verb} ${toolName}`}
        >
          <Trash2 aria-hidden />
        </Button>
      }
      title={title}
      description={copy.description}
      confirmLabel={copy.confirmLabel}
      action={() => removeTool({ toolId })}
      successMessage={copy.successMessage}
      onSuccess={onRemoved}
    />
  );
}
