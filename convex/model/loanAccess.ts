/*
 * Loan lookups that decide who may act.
 *
 * getLoanOrThrow: the loan, or a not-found error.
 * requireLoanRole: the caller must be the lender or the borrower, as the action requires.
 * requireLoanParty: the caller must be one of the two neighbors on the loan.
 * assertLoanStatus: rejects an action when the loan is in the wrong state.
 */

import { ConvexError } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { forbidden, notFound } from "../lib/errors";
import type {
  LoanAccess,
  LoanRole,
  LoanStatus,
  RequireLoanRoleArgs,
  UserMutationCtx,
} from "../types";

export async function getLoanOrThrow(ctx: MutationCtx, loanId: Id<"loans">) {
  const loan = await ctx.db.get("loans", loanId);

  if (!loan) throw notFound("Loan");

  return loan;
}

function partyId(loan: Doc<"loans">, role: LoanRole): Id<"users"> {
  return role === "lender" ? loan.lenderId : loan.borrowerId;
}

export async function requireLoanRole(
  ctx: UserMutationCtx,
  loanId: Id<"loans">,
  { role, deniedReason }: RequireLoanRoleArgs,
): Promise<LoanAccess> {
  const { user } = ctx;
  const loan = await getLoanOrThrow(ctx, loanId);

  if (partyId(loan, role) !== user._id) throw forbidden(deniedReason);

  return { user, loan };
}

export async function requireLoanParty(
  ctx: UserMutationCtx,
  loanId: Id<"loans">,
) {
  const { user } = ctx;
  const loan = await getLoanOrThrow(ctx, loanId);
  const isBorrower = loan.borrowerId === user._id;
  const isLender = loan.lenderId === user._id;

  if (!isBorrower && !isLender) {
    throw forbidden("You are not part of this loan.");
  }

  return { user, loan, isBorrower };
}

export function assertLoanStatus(loan: Doc<"loans">, status: LoanStatus) {
  if (loan.status !== status) {
    throw new ConvexError(`Only ${status} loans can perform this action.`);
  }
}
