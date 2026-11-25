import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Check, X } from "lucide-react";
import { ActionButton } from "@/components/shared/ActionButton";

interface DecisionButtonsProps {
  subject: "Request" | "Extension";
  approveLabel: string;
  approve: () => Promise<unknown>;
  decline: () => Promise<unknown>;
}

export function DecisionButtons({
  subject,
  approveLabel,
  approve,
  decline,
}: DecisionButtonsProps) {
  return (
    <>
      <ActionButton
        size="sm"
        action={approve}
        successMessage={`${subject} approved.`}
      >
        <Check aria-hidden />
        {approveLabel}
      </ActionButton>

      <ActionButton
        variant="outline"
        size="sm"
        action={decline}
        successMessage={`${subject} declined.`}
      >
        <X aria-hidden />
        Decline
      </ActionButton>
    </>
  );
}

export function CancelLoanButton({
  loanId,
  label,
}: {
  loanId: Id<"loans">;
  label: string;
}) {
  const cancel = useMutation(api.loans.cancel);

  return (
    <ActionButton
      variant="outline"
      size="sm"
      action={() => cancel({ loanId })}
      successMessage="Cancelled. The other neighbor is notified."
    >
      <X aria-hidden />
      {label}
    </ActionButton>
  );
}
