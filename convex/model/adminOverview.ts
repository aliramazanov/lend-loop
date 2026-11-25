import { Doc } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";
import { QUERY_LIMITS } from "../lib/config";
import { daysAgo, todayUtc } from "../lib/dates";
import { OVERVIEW_WINDOWS } from "../shared/policy";
import {
  hasReportedIssue,
  isAwaitingHandover,
  isEscalated,
  isOverdue,
} from "./loanRules";
import { isListed } from "./toolStore";

function countBy<Item>(items: Item[], keyOf: (item: Item) => string) {
  const counts: Record<string, number> = {};

  for (const item of items) {
    const key = keyOf(item);

    counts[key] = (counts[key] ?? 0) + 1;
  }

  return counts;
}

function requestsPerDay(loans: Doc<"loans">[], now: number) {
  const { trendDays } = OVERVIEW_WINDOWS;

  const days = Array.from({ length: trendDays }, (_, index) => {
    const daysBack = trendDays - 1 - index;

    return todayUtc(daysAgo(daysBack, now));
  });

  const requestsByDay = countBy(loans, (loan) => todayUtc(loan.createdAt));

  return days.map((date) => ({ date, requests: requestsByDay[date] ?? 0 }));
}

async function recentWorkflowFailures(ctx: QueryCtx, now: number) {
  const since = daysAgo(OVERVIEW_WINDOWS.failureWindowDays, now);

  return await ctx.db
    .query("automationEvents")
    .withIndex("by_event_type", (q) =>
      q.eq("eventType", "workflow_error").gte("_creationTime", since),
    )
    .take(QUERY_LIMITS.overviewScan);
}

export async function buildOverview(ctx: QueryCtx) {
  const now = Date.now();
  const today = todayUtc(now);

  const users = await ctx.db.query("users").take(QUERY_LIMITS.overviewScan);
  const tools = await ctx.db.query("tools").take(QUERY_LIMITS.overviewScan);

  const loans = await ctx.db
    .query("loans")
    .order("desc")
    .take(QUERY_LIMITS.overviewScan);

  const failures = await recentWorkflowFailures(ctx, now);

  const trustedLenders = users.filter((user) => user.trustedLender);
  const listedTools = tools.filter(isListed);
  const overdueLoans = loans.filter((loan) => isOverdue(loan, today));

  const awaitingHandover = loans.filter((loan) =>
    isAwaitingHandover(loan, today),
  );

  const reportedIssues = loans.filter(hasReportedIssue);
  const loansByStatus = countBy(loans, (loan) => loan.status);

  return {
    neighbors: users.length,
    trustedLenders: trustedLenders.length,
    activeListings: listedTools.length,
    removedListings: tools.length - listedTools.length,
    activeLoans: loansByStatus.active ?? 0,
    overdueLoans: overdueLoans.length,
    escalatedLoans: loans.filter((loan) => isEscalated(loan, today)).length,
    awaitingHandover: awaitingHandover.length,
    reportedIssues: reportedIssues.length,
    pendingRequests: loansByStatus.pending ?? 0,
    failedAutomations7d: failures.length,
    loansByStatus,
    listingsByCategory: countBy(listedTools, (tool) => tool.category),
    requestsPerDay: requestsPerDay(loans, now),
  };
}
