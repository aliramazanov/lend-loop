import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/AlertDialog";
import { withToast } from "@/lib/toast";
import type { ComponentProps, ReactNode } from "react";

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  confirmVariant?: ComponentProps<typeof AlertDialogAction>["variant"];
  confirmDisabled?: boolean;
  action: () => Promise<unknown>;
  successMessage: string;
  onSuccess?: () => void;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  confirmVariant = "destructive",
  confirmDisabled = false,
  action,
  successMessage,
  onSuccess,
  onOpenChange,
  children,
}: ConfirmDialogProps) {
  async function confirm() {
    const succeeded = await withToast(action(), successMessage);

    if (succeeded) onSuccess?.();
  }

  return (
    <AlertDialog onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {children}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            variant={confirmVariant}
            disabled={confirmDisabled}
            onClick={() => void confirm()}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
