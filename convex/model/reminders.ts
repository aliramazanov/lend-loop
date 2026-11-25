import { MutationCtx, QueryCtx } from "../_generated/server";
import { todayUtc } from "../lib/dates";
import { idempotencyKeys } from "../lib/events";
import { recordAutomationEvent } from "./automation";
import { scheduleLoanEmail } from "./emailScheduling";
import { isOverdue } from "./loanRules";
import { loansWithStatus } from "./loanStore";
import type {
  Loan,
  RecordDueSoonReminderArgs,
  RecordOverdueReminderArgs,
} from "../types";

function remindedOn(loan: Loan, today: string): boolean {
  return (
    loan.lastReminderAt !== undefined && todayUtc(loan.lastReminderAt) === today
  );
}

function isDueOn(loan: Loan, date: string): boolean {
  return (
    loan.status === "active" &&
    loan.endDate === date &&
    loan.returnClaimedAt === undefined
  );
}

async function toReminder(ctx: QueryCtx, loan: Loan) {
  const tool = await ctx.db.get("tools", loan.toolId);
  const borrower = await ctx.db.get("users", loan.borrowerId);

  return {
    loanId: loan._id,
    toolName: tool?.name ?? "Tool",
    endDate: loan.endDate,
    borrowerName: borrower?.name ?? "Neighbor",
  };
}

async function findLoan(ctx: QueryCtx, rawLoanId: string) {
  const loanId = ctx.db.normalizeId("loans", rawLoanId);

  return loanId ? await ctx.db.get("loans", loanId) : null;
}

export async function listOverdue(ctx: QueryCtx, today: string) {
  const active = await loansWithStatus(ctx, "active");

  const due = active.filter(
    (loan) =>
      isOverdue(loan, today) && !remindedOn(loan, today) && !loan.escalatedAt,
  );

  return await Promise.all(due.map((loan) => toReminder(ctx, loan)));
}

export async function listDueSoon(ctx: QueryCtx, tomorrow: string) {
  const active = await loansWithStatus(ctx, "active");

  const due = active.filter(
    (loan) => isDueOn(loan, tomorrow) && loan.dueSoonReminderAt === undefined,
  );

  return await Promise.all(due.map((loan) => toReminder(ctx, loan)));
}

export async function recordOverdueReminder(
  ctx: MutationCtx,
  { loanId, today }: RecordOverdueReminderArgs,
) {
  const loan = await findLoan(ctx, loanId);

  if (!loan || !isOverdue(loan, today) || loan.escalatedAt) return null;

  const idempotencyKey = idempotencyKeys.overdueReminder(loan._id, today);

  const result = await recordAutomationEvent(ctx, {
    loanId: loan._id,
    idempotencyKey,
    eventType: "overdue_reminder",
    summary: `Overdue reminder sent (${today})`,
  });

  if (!result.deduplicated) {
    await scheduleLoanEmail(ctx, {
      emailId: idempotencyKey,
      kind: "overdue_reminder",
      loan,
      recipientId: loan.borrowerId,
    });
  }

  return result;
}

export async function recordDueSoonReminder(
  ctx: MutationCtx,
  { loanId, tomorrow }: RecordDueSoonReminderArgs,
) {
  const loan = await findLoan(ctx, loanId);

  if (!loan || !isDueOn(loan, tomorrow)) return null;

  const idempotencyKey = idempotencyKeys.dueSoonReminder(
    loan._id,
    loan.endDate,
  );

  const result = await recordAutomationEvent(ctx, {
    loanId: loan._id,
    idempotencyKey,
    eventType: "due_soon_reminder",
    summary: `Due tomorrow reminder sent (${loan.endDate})`,
  });

  if (!result.deduplicated) {
    await scheduleLoanEmail(ctx, {
      emailId: idempotencyKey,
      kind: "due_soon_reminder",
      loan,
      recipientId: loan.borrowerId,
    });
  }

  return result;
}
