import { Button } from "@/components/ui/Button";
import { withToast } from "@/lib/toast";
import { useState, type ComponentProps } from "react";

interface ActionButtonProps extends Omit<
  ComponentProps<typeof Button>,
  "onClick" | "asChild"
> {
  action: () => Promise<unknown>;
  successMessage: string;
  onSuccess?: () => void;
}

export function ActionButton({
  action,
  successMessage,
  onSuccess,
  disabled,
  ...buttonProps
}: ActionButtonProps) {
  const [isPending, setIsPending] = useState(false);

  async function run() {
    setIsPending(true);

    const succeeded = await withToast(action(), successMessage);

    setIsPending(false);

    if (succeeded) onSuccess?.();
  }

  return (
    <Button
      {...buttonProps}
      disabled={disabled || isPending}
      aria-busy={isPending}
      onClick={() => void run()}
    />
  );
}
