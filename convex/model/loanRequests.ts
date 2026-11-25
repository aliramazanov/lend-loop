import { ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { todayUtc, type DateRange } from "../lib/dates";
import { forbidden } from "../lib/errors";
import { enforceRateLimit } from "../lib/rateLimiter";
import { requireUser } from "./auth";
import {
  assertLoanStatus,
  requireLoanParty,
  requireLoanRole,
} from "./loanAccess";
import { assertValidLoanDates, isBeforeHandover } from "./loanRules";
import { assertDatesAreFree, assertNoDuplicateRequest } from "./loanStore";
import {
  declineCompetingRequests,
  notifyLoanChange,
  transitionLoan,
} from "./loanTransitions";
import { getActiveToolOrThrow } from "./toolStore";

type BorrowRequest = DateRange & { toolId: Id<"tools"> };

export async function requestBorrow(
  ctx: MutationCtx,
  { toolId, startDate, endDate }: BorrowRequest,
) {
  const user = await requireUser(ctx);
  const range = { startDate, endDate };

  assertValidLoanDates(range, todayUtc());

  const tool = await getActiveToolOrThrow(ctx, toolId);

  if (tool.ownerId === user._id) {
    throw new ConvexError("You cannot request to borrow your own tool.");
  }

  await assertDatesAreFree(ctx, { toolId, range });
  await assertNoDuplicateRequest(ctx, { toolId, range, borrowerId: user._id });
  await enforceRateLimit(ctx, "borrowRequest", user._id);

  const now = Date.now();

  const loanId = await ctx.db.insert("loans", {
    ...range,
    toolId,
    lenderId: tool.ownerId,
    borrowerId: user._id,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });

  const loan = await ctx.db.get("loans", loanId);

  if (loan) {
    await notifyLoanChange(ctx, {
      loan,
      event: "loan_requested",
      recipientId: tool.ownerId,
    });
  }

  return loanId;
}

export async function approve(ctx: MutationCtx, loanId: Id<"loans">) {
  const { user, loan } = await requireLoanRole(ctx, loanId, {
    role: "lender",
    deniedReason: "Only the tool owner can approve requests.",
  });

  assertLoanStatus(loan, "pending");

  await enforceRateLimit(ctx, "loanDecision", user._id);

  if (loan.startDate < todayUtc()) {
    throw new ConvexError(
      "This request has expired because its start date has passed.",
    );
  }

  await getActiveToolOrThrow(ctx, loan.toolId);

  await assertDatesAreFree(ctx, {
    toolId: loan.toolId,
    range: loan,
    ignoredLoanId: loan._id,
  });

  await transitionLoan(ctx, loan, {
    status: "approved",
    event: "loan_approved",
    recipientId: loan.borrowerId,
  });

  const autoDeclined = await declineCompetingRequests(ctx, loan, loan);

  return { autoDeclined };
}

export async function decline(ctx: MutationCtx, loanId: Id<"loans">) {
  const { user, loan } = await requireLoanRole(ctx, loanId, {
    role: "lender",
    deniedReason: "Only the tool owner can decline requests.",
  });

  assertLoanStatus(loan, "pending");

  await enforceRateLimit(ctx, "loanDecision", user._id);

  await transitionLoan(ctx, loan, {
    status: "declined",
    event: "loan_declined",
    recipientId: loan.borrowerId,
  });
}

export async function cancel(ctx: MutationCtx, loanId: Id<"loans">) {
  const { user, loan, isBorrower } = await requireLoanParty(ctx, loanId);

  if (loan.status === "pending" && !isBorrower) {
    throw forbidden("Only the borrower can cancel a pending request.");
  }

  if (!isBeforeHandover(loan)) {
    throw new ConvexError(
      "Only loans that weren't handed over can be cancelled.",
    );
  }

  await enforceRateLimit(ctx, "loanDecision", user._id);

  await transitionLoan(ctx, loan, {
    status: "cancelled",
    event: "loan_cancelled",
    recipientId: isBorrower ? loan.lenderId : loan.borrowerId,
  });
}
