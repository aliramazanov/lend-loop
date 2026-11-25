import { Button } from "@/components/ui/Button";
import { withToast } from "@/lib/toast";
import { useState } from "react";
import type { ActionButtonProps } from "@/types";

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
