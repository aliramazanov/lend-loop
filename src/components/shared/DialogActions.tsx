import { Button } from "@/components/ui/Button";
import { DialogClose, DialogFooter } from "@/components/ui/Dialog";
import type { DialogActionsProps } from "@/types";

export function DialogActions({
  confirmLabel,
  confirmVariant = "default",
  disabled = false,
  onConfirm,
}: DialogActionsProps) {
  return (
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>

      <DialogClose asChild>
        <Button
          variant={confirmVariant}
          disabled={disabled}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </DialogClose>
    </DialogFooter>
  );
}
