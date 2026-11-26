/*
 * Asking for more days.
 *
 * requestExtension: the borrower asks for a later end date. The whole loan must stay
 * within the 30-day limit, and only one request can be open at a time.
 * respondToExtension: the owner approves or declines. Approval checks that the extra
 * days are still free and declines other requests that now overlap.
 */

import { ConvexError } from "convex/values";
import { Doc } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { enforceRateLimit } from "../lib/rateLimiter";
import { requireLoanRole } from "./loanAccess";
import { assertValidLoanDates, isOpen } from "./loanRules";
import { assertDatesAreFree } from "./loanStore";
import { declineCompetingRequests, notifyLoanChange } from "./loanTransitions";
import type {
  ExtensionAnswer,
  ExtensionRequest,
  UserMutationCtx,
} from "../types";

function assertCanExtend(loan: Doc<"loans">, endDate: string) {
  if (loan.status !== "approved" && loan.status !== "active") {
    throw new ConvexError("Only upcoming or active loans can be extended.");
  }

  if (loan.extensionEndDate) {
    throw new ConvexError(
      "An extension request is already waiting for the owner.",
    );
  }

  if (endDate <= loan.endDate) {
    throw new ConvexError("Pick an end date after the current one.");
  }
}

async function declineExtension(ctx: MutationCtx, loan: Doc<"loans">) {
  await ctx.db.patch("loans", loan._id, {
    extensionEndDate: undefined,
    updatedAt: Date.now(),
  });

  await notifyLoanChange(ctx, {
    loan,
    event: "loan_extension_declined",
    recipientId: loan.borrowerId,
  });
}

async function approveExtension(
  ctx: MutationCtx,
  loan: Doc<"loans">,
  endDate: string,
) {
  const extendedRange = { startDate: loan.startDate, endDate };

  await assertDatesAreFree(ctx, {
    toolId: loan.toolId,
    range: extendedRange,
    ignoredLoanId: loan._id,
  });

  await ctx.db.patch("loans", loan._id, {
    endDate,
    extensionEndDate: undefined,
    escalatedAt: undefined,
    updatedAt: Date.now(),
  });

  await notifyLoanChange(ctx, {
    loan: { ...loan, endDate },
    event: "loan_extension_approved",
    recipientId: loan.borrowerId,
  });

  await declineCompetingRequests(ctx, loan, extendedRange);
}

export async function requestExtension(
  ctx: UserMutationCtx,
  { loanId, endDate }: ExtensionRequest,
) {
  const { user, loan } = await requireLoanRole(ctx, loanId, {
    role: "borrower",
    deniedReason: "Only the borrower can do this.",
  });

  assertCanExtend(loan, endDate);

  await enforceRateLimit(ctx, "loanDecision", user._id);

  const extendedRange = { startDate: loan.startDate, endDate };

  assertValidLoanDates(extendedRange, loan.startDate);

  await assertDatesAreFree(ctx, {
    toolId: loan.toolId,
    range: extendedRange,
    ignoredLoanId: loan._id,
  });

  await ctx.db.patch("loans", loan._id, {
    extensionEndDate: endDate,
    updatedAt: Date.now(),
  });

  await notifyLoanChange(ctx, {
    loan,
    event: "loan_extension_requested",
    recipientId: loan.lenderId,
  });
}

export async function respondToExtension(
  ctx: UserMutationCtx,
  { loanId, approve }: ExtensionAnswer,
) {
  const { user, loan } = await requireLoanRole(ctx, loanId, {
    role: "lender",
    deniedReason: "Only the tool owner can answer an extension request.",
  });

  const endDate = loan.extensionEndDate;

  if (!endDate || !isOpen(loan.status)) {
    throw new ConvexError("There is no open extension request.");
  }

  await enforceRateLimit(ctx, "loanDecision", user._id);

  if (approve) {
    await approveExtension(ctx, loan, endDate);
  } else {
    await declineExtension(ctx, loan);
  }
}
