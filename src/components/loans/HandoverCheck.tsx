/*
 * The second half of the two-sided handover.
 *
 * needsHandoverCheck: whether this neighbor still has to agree to the other's confirmation.
 * HandoverCheck: the buttons to agree, or to say the handover did not happen.
 */

import { ActionButton } from "@/components/shared/ActionButton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { Check } from "lucide-react";
import type { HandoverCheckProps, LoanView } from "@/types";
import type { LoanParty } from "@convex/types";

export function needsHandoverCheck(loan: LoanView, party: LoanParty) {
  return (
    loan.status === "active" &&
    !loan.handoverAcknowledged &&
    !loan.returnClaimedAt &&
    (loan.handoverConfirmedBy ?? "lender") !== party
  );
}

export function HandoverCheck({ loan }: HandoverCheckProps) {
  const acknowledge = useMutation(api.loans.acknowledgeHandover);
  const dispute = useMutation(api.loans.disputeHandover);
  const loanId = loan._id;

  return (
    <>
      <ActionButton
        size="sm"
        action={() => acknowledge({ loanId })}
        successMessage="Handover confirmed by both of you."
      >
        <Check aria-hidden />
        Yes, handed over
      </ActionButton>

      <ConfirmDialog
        trigger={
          <Button variant="outline" size="sm">
            It didn&apos;t happen
          </Button>
        }
        title="Say the handover didn't happen?"
        description={`The loan of ${loan.toolName} goes back to waiting for pickup, the other neighbor is told, and an admin can see it in the audit log.`}
        confirmLabel="It didn't happen"
        action={() => dispute({ loanId })}
        successMessage="Handover disputed. The loan is waiting for pickup again."
      />
    </>
  );
}
