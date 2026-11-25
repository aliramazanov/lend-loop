import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { ActionButton } from "@/components/shared/ActionButton";
import type { LoanView } from "@/lib/convexTypes";
import { HandoverCheck, needsHandoverCheck } from "./HandoverCheck";
import { CancelLoanButton } from "./LoanButtons";
import { RequestExtensionDialog } from "./RequestExtensionDialog";

export function BorrowerActions({ loan }: { loan: LoanView }) {
  const claimReturn = useMutation(api.loans.claimReturn);
  const confirmHandover = useMutation(api.loans.confirmHandover);
  const loanId = loan._id;
  const isActive = loan.status === "active";
  const isApproved = loan.status === "approved";
  const canCancel = loan.status === "pending" || isApproved;
  const canExtend = (isApproved || isActive) && !loan.extensionEndDate;
  const canPickUp = isApproved && loan.hasStarted;

  return (
    <>
      {canPickUp && (
        <ActionButton
          size="sm"
          action={() => confirmHandover({ loanId })}
          successMessage="Pickup confirmed. The owner is asked to confirm it too."
        >
          I picked it up
        </ActionButton>
      )}

      {needsHandoverCheck(loan, "borrower") && <HandoverCheck loan={loan} />}

      {isActive && !loan.returnClaimedAt && (
        <ActionButton
          size="sm"
          action={() => claimReturn({ loanId })}
          successMessage="The owner will confirm the return."
        >
          I&apos;ve returned it
        </ActionButton>
      )}

      {canExtend && <RequestExtensionDialog loan={loan} />}

      {canCancel && (
        <CancelLoanButton
          loanId={loanId}
          label={isApproved ? "Cancel loan" : "Cancel request"}
        />
      )}
    </>
  );
}
