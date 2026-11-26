/*
 * What loan cards and tables show.
 *
 * toLoanViews: tool and neighbor names, status flags and the recent activity log.
 * borrowerHistory, withBorrowerHistories: a requester's record (completed loans, late
 * returns and reported problems) shown to the owner before they approve.
 */

import { Doc, Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";
import { QUERY_LIMITS } from "../lib/config";
import { todayUtc } from "../lib/dates";
import { isUnavailable } from "./loanAdmin";
import {
  hasReportedIssue,
  hasStarted,
  isEscalated,
  isOverdue,
  wasReturnedLate,
} from "./loanRules";
import { loansAsBorrower } from "./loanStore";

async function recentActivity(ctx: QueryCtx, loanId: Id<"loans">) {
  const events = await ctx.db
    .query("automationEvents")
    .withIndex("by_loan", (q) => q.eq("loanId", loanId))
    .order("desc")
    .take(QUERY_LIMITS.loanActivity);

  return events.map((event) => ({
    _id: event._id,
    eventType: event.eventType,
    summary: event.summary,
    createdAt: event.createdAt,
  }));
}

async function toLoanView(ctx: QueryCtx, loan: Doc<"loans">, today: string) {
  const tool = await ctx.db.get("tools", loan.toolId);
  const lender = await ctx.db.get("users", loan.lenderId);
  const borrower = await ctx.db.get("users", loan.borrowerId);

  return {
    _id: loan._id,
    toolId: loan.toolId,
    toolName: tool?.name ?? "Deleted tool",
    toolCategory: tool?.category ?? "other",
    toolArchived: Boolean(tool?.archivedAt),
    lenderName: lender?.name ?? "Neighbor",
    lenderTrusted: lender?.trustedLender ?? false,
    lenderUnavailable: isUnavailable(lender),
    borrowerName: borrower?.name ?? "Neighbor",
    startDate: loan.startDate,
    endDate: loan.endDate,
    status: loan.status,
    hasStarted: hasStarted(loan, today),
    isOverdue: isOverdue(loan, today),
    handedOverAt: loan.handedOverAt ?? null,
    handoverConfirmedBy: loan.handoverConfirmedBy ?? null,
    handoverAcknowledged: Boolean(loan.handoverAcknowledgedAt),
    isEscalated: isEscalated(loan, today),
    returnClaimedAt: loan.returnClaimedAt ?? null,
    returnCondition: loan.returnCondition ?? null,
    returnNote: loan.returnNote ?? null,
    extensionEndDate: loan.extensionEndDate ?? null,
    lastReminderAt: loan.lastReminderAt ?? null,
    lastAutomationSummary: loan.lastAutomationSummary ?? null,
    events: await recentActivity(ctx, loan._id),
    createdAt: loan.createdAt,
    updatedAt: loan.updatedAt,
  };
}

export async function toLoanViews(ctx: QueryCtx, loans: Doc<"loans">[]) {
  const today = todayUtc();

  return await Promise.all(loans.map((loan) => toLoanView(ctx, loan, today)));
}

export async function borrowerHistory(ctx: QueryCtx, borrowerId: Id<"users">) {
  const today = todayUtc();
  const borrower = await ctx.db.get("users", borrowerId);
  const loans = await loansAsBorrower(ctx, borrowerId);
  const returned = loans.filter((loan) => loan.status === "returned");

  return {
    memberSince: borrower?.createdAt ?? null,
    completedLoans: returned.length,
    lateReturns: returned.filter(wasReturnedLate).length,
    reportedIssues: returned.filter(hasReportedIssue).length,
    overdueNow: loans.filter((loan) => isOverdue(loan, today)).length,
  };
}

export async function withBorrowerHistories(
  ctx: QueryCtx,
  loans: Doc<"loans">[],
) {
  const views = await toLoanViews(ctx, loans);
  const borrowerIds = [...new Set(loans.map((loan) => loan.borrowerId))];

  const histories = new Map(
    await Promise.all(
      borrowerIds.map(
        async (borrowerId) =>
          [borrowerId, await borrowerHistory(ctx, borrowerId)] as const,
      ),
    ),
  );

  return views.map((view, index) => ({
    ...view,
    borrowerHistory: histories.get(loans[index].borrowerId) ?? null,
  }));
}
