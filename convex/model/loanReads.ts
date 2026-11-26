/*
 * Loan lists for the borrower, the owner and admins, ready for display.
 * Owners also get each requester's history so they can decide on a request.
 */

import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";
import { QUERY_LIMITS } from "../lib/config";
import { loansAsLender } from "./loanStore";
import { toLoanViews, withBorrowerHistories } from "./loanViews";

export async function byBorrower(ctx: QueryCtx, borrowerId: Id<"users">) {
  const loans = await ctx.db
    .query("loans")
    .withIndex("by_borrower", (q) => q.eq("borrowerId", borrowerId))
    .order("desc")
    .take(QUERY_LIMITS.personalLoans);

  return await toLoanViews(ctx, loans);
}

export async function forLender(ctx: QueryCtx, lenderId: Id<"users">) {
  const loans = await ctx.db
    .query("loans")
    .withIndex("by_lender", (q) => q.eq("lenderId", lenderId))
    .order("desc")
    .take(QUERY_LIMITS.personalLoans);

  return await withBorrowerHistories(ctx, loans);
}

export async function all(ctx: QueryCtx) {
  const loans = await ctx.db
    .query("loans")
    .order("desc")
    .take(QUERY_LIMITS.adminLoans);

  return await toLoanViews(ctx, loans);
}

export async function pendingCountForLender(
  ctx: QueryCtx,
  lenderId: Id<"users">,
) {
  const loans = await loansAsLender(ctx, lenderId);

  return loans.filter((loan) => loan.status === "pending").length;
}
