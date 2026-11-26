/*
 * Two-sided handover, so one neighbor cannot put the other on the hook alone.
 *
 * confirmHandover: either neighbor marks the pickup, from the start day on.
 * acknowledgeHandover: the other neighbor agrees it happened.
 * disputeHandover: the other neighbor says it did not. The loan goes back to waiting for
 * pickup, the first neighbor is told, and the audit log records it. Not possible once
 * both agreed or the return has started.
 */

import { ConvexError } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { todayUtc } from "../lib/dates";
import { enforceRateLimit } from "../lib/rateLimiter";
import { recordAudit } from "./audit";
import { assertLoanStatus, requireLoanParty } from "./loanAccess";
import { transitionLoan } from "./loanTransitions";
import type { LoanParty, UserMutationCtx } from "../types";

function otherParty(loan: Doc<"loans">, isBorrower: boolean): Id<"users"> {
  return isBorrower ? loan.lenderId : loan.borrowerId;
}

async function requireCounterparty(ctx: UserMutationCtx, loanId: Id<"loans">) {
  const access = await requireLoanParty(ctx, loanId);
  const { loan, isBorrower, user } = access;
  const party: LoanParty = isBorrower ? "borrower" : "lender";

  assertLoanStatus(loan, "active");

  if ((loan.handoverConfirmedBy ?? "lender") === party) {
    throw new ConvexError("The other neighbor confirms this step.");
  }

  if (loan.handoverAcknowledgedAt) {
    throw new ConvexError("You both confirmed this handover already.");
  }

  await enforceRateLimit(ctx, "loanDecision", user._id);

  return access;
}

export async function confirmHandover(
  ctx: UserMutationCtx,
  loanId: Id<"loans">,
) {
  const { user, loan, isBorrower } = await requireLoanParty(ctx, loanId);

  assertLoanStatus(loan, "approved");

  await enforceRateLimit(ctx, "loanDecision", user._id);

  if (loan.startDate > todayUtc()) {
    throw new ConvexError(
      "This loan hasn't started yet. Confirm the handover on the start day.",
    );
  }

  await transitionLoan(ctx, loan, {
    status: "active",
    event: "loan_handed_over",
    recipientId: otherParty(loan, isBorrower),
    fields: {
      handedOverAt: Date.now(),
      handoverConfirmedBy: isBorrower ? "borrower" : "lender",
    },
  });
}

export async function acknowledgeHandover(
  ctx: UserMutationCtx,
  loanId: Id<"loans">,
) {
  const { loan } = await requireCounterparty(ctx, loanId);
  const now = Date.now();

  await ctx.db.patch("loans", loan._id, {
    handoverAcknowledgedAt: now,
    updatedAt: now,
  });
}

export async function disputeHandover(
  ctx: UserMutationCtx,
  loanId: Id<"loans">,
) {
  const { user, loan, isBorrower } = await requireCounterparty(ctx, loanId);

  if (loan.returnClaimedAt) {
    throw new ConvexError("The return is already under way.");
  }

  await transitionLoan(ctx, loan, {
    status: "approved",
    event: "loan_handover_disputed",
    recipientId: otherParty(loan, isBorrower),
    fields: { handedOverAt: undefined, handoverConfirmedBy: undefined },
  });

  const tool = await ctx.db.get("tools", loan.toolId);

  await recordAudit(ctx, {
    actorId: user._id,
    action: "handover_disputed",
    targetType: "loan",
    targetId: loan._id,
    summary: `${user.name} says the handover of "${tool?.name ?? "a tool"}" did not happen`,
  });
}
