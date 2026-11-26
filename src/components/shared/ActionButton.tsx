/*
 * ActionButton: a button that runs one action, stays disabled while it is in progress
 * so a double click sends nothing twice, and reports the result as a toast.
 */

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
