import { formatDay } from "@/lib/dates";
import { BorrowerHistory } from "./BorrowerHistory";
import { needsHandoverCheck } from "./HandoverCheck";
import type { LoanNoticesProps, LoanView, Perspective } from "@/types";

function extensionNotice(loan: LoanView, perspective: Perspective) {
  if (!loan.extensionEndDate) return null;

  const until = formatDay(loan.extensionEndDate);

  return perspective === "lender"
    ? `${loan.borrowerName} asks to keep it until ${until}`
    : `Extension to ${until} requested`;
}

function returnNotice(loan: LoanView, perspective: Perspective) {
  if (loan.status !== "active" || !loan.returnClaimedAt) return null;

  return perspective === "lender"
    ? `${loan.borrowerName} says it's back. Check it and confirm.`
    : "You marked it as returned. Waiting for the owner to confirm.";
}

function handoverNotice(loan: LoanView, perspective: Perspective) {
  if (loan.status !== "approved" || !loan.hasStarted) return null;

  return perspective === "lender"
    ? "Hand the tool over, then confirm it here. If they don't show up, cancel the loan."
    : "Pick it up from the owner, then confirm it here.";
}

function handshakeNotice(loan: LoanView, perspective: Perspective) {
  if (!needsHandoverCheck(loan, perspective)) return null;

  return perspective === "lender"
    ? `${loan.borrowerName} says they picked it up. Confirm, or say it didn't happen.`
    : "The owner marked it as handed over. Confirm, or say it didn't happen.";
}

function escalationNotice(loan: LoanView) {
  return loan.isEscalated
    ? "Long overdue. Reminders have stopped and an admin is following up."
    : null;
}

export function LoanNotices({ loan, perspective }: LoanNoticesProps) {
  const showsHistory = perspective === "lender" && loan.status === "pending";
  const history = showsHistory ? loan.borrowerHistory : null;
  const extension = extensionNotice(loan, perspective);
  const returned = returnNotice(loan, perspective);
  const handover = handoverNotice(loan, perspective);
  const handshake = handshakeNotice(loan, perspective);
  const escalation = escalationNotice(loan);

  return (
    <>
      {history && <BorrowerHistory history={history} />}

      {extension && (
        <p className="text-xs font-medium text-sky-800">{extension}</p>
      )}

      {returned && (
        <p className="text-xs font-medium text-emerald-800">{returned}</p>
      )}

      {handover && <p className="text-xs text-stone-600">{handover}</p>}

      {handshake && (
        <p className="text-xs font-medium text-sky-800">{handshake}</p>
      )}

      {escalation && (
        <p className="text-xs font-medium text-red-800">{escalation}</p>
      )}

      {loan.returnNote && (
        <p className="text-xs text-stone-600">Return note: {loan.returnNote}</p>
      )}
    </>
  );
}
