/*
 * AccessControl: the suspend or reinstate button for one neighbor.
 * Suspension asks for a reason, which goes to the audit log. Admins have no button.
 */

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Label, Textarea } from "@/components/ui/Field";
import { api } from "@convex/_generated/api";
import { MODERATION_POLICY } from "@convex/shared/policy";
import { useMutation } from "convex/react";
import { useState } from "react";
import type {
  AccessControlProps,
  ReinstateButtonProps,
  SuspendButtonProps,
} from "@/types";

const { suspensionReasonLength } = MODERATION_POLICY;

const SUSPEND_DESCRIPTION =
  "They are signed out and blocked. Their listings are hidden, requests and loans not yet handed over are cancelled with notifications, and tools already handed over stay on loan until they come back.";

const REINSTATE_DESCRIPTION =
  "They can sign in, list and borrow again. Their hidden listings stay hidden until they restore them.";

function ReinstateButton({ user }: ReinstateButtonProps) {
  const reinstate = useMutation(api.users.reinstate);

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="sm">
          Reinstate
        </Button>
      }
      title={`Reinstate ${user.name}?`}
      description={REINSTATE_DESCRIPTION}
      confirmLabel="Reinstate"
      confirmVariant="default"
      action={() => reinstate({ userId: user._id })}
      successMessage="User reinstated."
    />
  );
}

function SuspendButton({ user }: SuspendButtonProps) {
  const suspend = useMutation(api.users.suspend);
  const [reason, setReason] = useState("");
  const trimmedReason = reason.trim();

  return (
    <ConfirmDialog
      trigger={
        <Button variant="danger" size="sm">
          Suspend
        </Button>
      }
      title={`Suspend ${user.name}?`}
      description={SUSPEND_DESCRIPTION}
      confirmLabel="Suspend user"
      confirmDisabled={trimmedReason.length < suspensionReasonLength.min}
      onOpenChange={(open) => !open && setReason("")}
      action={() => suspend({ userId: user._id, reason: trimmedReason })}
      successMessage="User suspended and signed out."
    >
      <div>
        <Label htmlFor={`suspend-reason-${user._id}`}>
          Reason (kept in the audit log)
        </Label>
        <Textarea
          id={`suspend-reason-${user._id}`}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={suspensionReasonLength.max}
          rows={2}
          placeholder="e.g. Repeated no-shows on approved loans"
        />
      </div>
    </ConfirmDialog>
  );
}

export function AccessControl({ user }: AccessControlProps) {
  if (user.role === "admin") {
    return <span className="text-xs text-muted-foreground">Admin</span>;
  }

  return user.suspended ? (
    <ReinstateButton user={user} />
  ) : (
    <SuspendButton user={user} />
  );
}
