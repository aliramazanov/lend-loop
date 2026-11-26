/*
 * LenderActions: the owner's buttons on a loan card, which change with the loan's stage.
 * Approve or decline a request or extension, confirm the handover, confirm the return
 * or cancel an upcoming loan.
 */

import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { ActionButton } from "@/components/shared/ActionButton";
import { ConfirmReturnDialog } from "./ConfirmReturnDialog";
import { HandoverCheck, needsHandoverCheck } from "./HandoverCheck";
import { CancelLoanButton, DecisionButtons } from "./LoanButtons";
import type { LenderActionsProps } from "@/types";

export function LenderActions({ loan }: LenderActionsProps) {
  const approve = useMutation(api.loans.approve);
  const decline = useMutation(api.loans.decline);
  const confirmHandover = useMutation(api.loans.confirmHandover);
  const respondToExtension = useMutation(api.loans.respondToExtension);
  const loanId = loan._id;
  const awaitsHandover = loan.status === "approved" && loan.hasStarted;

  return (
    <>
      {loan.status === "pending" && (
        <DecisionButtons
          subject="Request"
          approveLabel="Approve"
          approve={() => approve({ loanId })}
          decline={() => decline({ loanId })}
        />
      )}

      {loan.extensionEndDate && (
        <DecisionButtons
          subject="Extension"
          approveLabel="Approve extension"
          approve={() => respondToExtension({ loanId, approve: true })}
          decline={() => respondToExtension({ loanId, approve: false })}
        />
      )}

      {awaitsHandover && (
        <ActionButton
          size="sm"
          action={() => confirmHandover({ loanId })}
          successMessage="Handover confirmed. The loan is active."
        >
          Confirm handover
        </ActionButton>
      )}

      {needsHandoverCheck(loan, "lender") && <HandoverCheck loan={loan} />}

      {loan.status === "active" && (
        <ConfirmReturnDialog
          loanId={loanId}
          toolName={loan.toolName}
          borrowerName={loan.borrowerName}
        />
      )}

      {loan.status === "approved" && (
        <CancelLoanButton loanId={loanId} label="Cancel loan" />
      )}
    </>
  );
}
