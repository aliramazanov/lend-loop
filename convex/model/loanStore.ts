/*
 * Loan queries by tool, status, borrower and owner, and the booking checks built on them.
 *
 * assertDatesAreFree: rejects dates that overlap an upcoming or active loan.
 * assertNoDuplicateRequest: stops a borrower from asking twice for overlapping dates.
 */

import { ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";
import { datesOverlap, todayUtc } from "../lib/dates";
import { blockedRange, isOnLoanToday, isStillOut } from "./loanRules";
import type {
  AssertDatesAreFreeArgs,
  AssertNoDuplicateRequestArgs,
  LoanStatus,
} from "../types";

export async function loansForTool(
  ctx: QueryCtx,
  toolId: Id<"tools">,
  status: LoanStatus,
) {
  return await ctx.db
    .query("loans")
    .withIndex("by_tool_status", (q) =>
      q.eq("toolId", toolId).eq("status", status),
    )
    .collect();
}

export async function loansWithStatus(ctx: QueryCtx, status: LoanStatus) {
  return await ctx.db
    .query("loans")
    .withIndex("by_status", (q) => q.eq("status", status))
    .collect();
}

export async function bookedLoansForTool(ctx: QueryCtx, toolId: Id<"tools">) {
  const approved = await loansForTool(ctx, toolId, "approved");
  const active = await loansForTool(ctx, toolId, "active");

  return [...approved, ...active];
}

export async function isToolOnLoan(
  ctx: QueryCtx,
  toolId: Id<"tools">,
  today: string,
): Promise<boolean> {
  const booked = await bookedLoansForTool(ctx, toolId);

  return booked.some((loan) => isOnLoanToday(loan, today));
}

export async function loansAsBorrower(ctx: QueryCtx, borrowerId: Id<"users">) {
  return await ctx.db
    .query("loans")
    .withIndex("by_borrower", (q) => q.eq("borrowerId", borrowerId))
    .collect();
}

export async function loansAsLender(ctx: QueryCtx, lenderId: Id<"users">) {
  return await ctx.db
    .query("loans")
    .withIndex("by_lender", (q) => q.eq("lenderId", lenderId))
    .collect();
}

export async function assertDatesAreFree(
  ctx: QueryCtx,
  { toolId, range, ignoredLoanId }: AssertDatesAreFreeArgs,
) {
  const today = todayUtc();
  const booked = await bookedLoansForTool(ctx, toolId);

  const conflict = booked.find(
    (loan) =>
      loan._id !== ignoredLoanId &&
      datesOverlap(blockedRange(loan, today), range),
  );

  if (conflict && isStillOut(conflict, today)) {
    throw new ConvexError(
      "This tool is still out past its return date, so it can't be booked until it's back.",
    );
  }

  if (conflict) {
    throw new ConvexError("An approved loan overlaps these dates.");
  }
}

export async function assertNoDuplicateRequest(
  ctx: QueryCtx,
  { toolId, range, borrowerId }: AssertNoDuplicateRequestArgs,
) {
  const pending = await loansForTool(ctx, toolId, "pending");

  const duplicate = pending.some(
    (loan) => loan.borrowerId === borrowerId && datesOverlap(loan, range),
  );

  if (duplicate) {
    throw new ConvexError(
      "You already have a pending request for overlapping dates.",
    );
  }
}
