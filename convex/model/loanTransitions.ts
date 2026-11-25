import { internal } from "../_generated/api";
import { Doc } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { datesOverlap } from "../lib/dates";
import { loanEventId } from "../lib/events";
import { scheduleLoanEmail } from "./emailScheduling";
import { isOpen } from "./loanRules";
import { loansForTool } from "./loanStore";
import type { DateRange, LoanNotice, LoanTransition } from "../types";

export async function notifyLoanChange(
  ctx: MutationCtx,
  { loan, event, recipientId }: LoanNotice,
) {
  const tool = await ctx.db.get("tools", loan.toolId);
  const recipient = await ctx.db.get("users", recipientId);
  const eventId = loanEventId(loan._id, event, Date.now());

  await scheduleLoanEmail(ctx, {
    emailId: eventId,
    kind: event,
    loan,
    recipientId,
  });

  await ctx.scheduler.runAfter(0, internal.n8n.deliverLoanEvent, {
    eventId,
    eventType: event,
    loanId: loan._id,
    toolName: tool?.name ?? "Tool",
    status: loan.status,
    startDate: loan.startDate,
    endDate: loan.endDate,
    recipientName: recipient?.name ?? "Neighbor",
    attempt: 0,
  });
}

export async function transitionLoan(
  ctx: MutationCtx,
  loan: Doc<"loans">,
  { status, event, recipientId, fields }: LoanTransition,
) {
  const closesLoan = !isOpen(status);

  const changes = {
    ...fields,
    ...(closesLoan ? { extensionEndDate: undefined } : {}),
    status,
    updatedAt: Date.now(),
  };

  await ctx.db.patch("loans", loan._id, changes);

  await notifyLoanChange(ctx, {
    loan: { ...loan, ...changes },
    event,
    recipientId,
  });
}

export async function declineRequests(
  ctx: MutationCtx,
  requests: Doc<"loans">[],
  event: "loan_declined" | "loan_withdrawn",
) {
  for (const request of requests) {
    await transitionLoan(ctx, request, {
      status: "declined",
      event,
      recipientId: request.borrowerId,
    });
  }
}

export async function declineCompetingRequests(
  ctx: MutationCtx,
  winner: Doc<"loans">,
  range: DateRange,
) {
  const pending = await loansForTool(ctx, winner.toolId, "pending");

  const competing = pending.filter(
    (loan) => loan._id !== winner._id && datesOverlap(loan, range),
  );

  await declineRequests(ctx, competing, "loan_declined");

  return competing.length;
}
