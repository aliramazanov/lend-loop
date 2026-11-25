import { Doc } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { daysBetween, todayUtc } from "../lib/dates";
import { idempotencyKeys } from "../lib/events";
import { LOAN_POLICY } from "../shared/policy";
import { recordAutomationEvent } from "./automation";
import { scheduleLoanEmail } from "./emailScheduling";
import { isUnavailable } from "./loanAdmin";
import { isOverdue } from "./loanRules";
import { loansWithStatus } from "./loanStore";

function needsEscalation(loan: Doc<"loans">, today: string): boolean {
  return (
    isOverdue(loan, today) &&
    loan.escalatedAt === undefined &&
    daysBetween(loan.endDate, today) >= LOAN_POLICY.escalateAfterOverdueDays
  );
}

async function availableAdmins(ctx: MutationCtx) {
  const admins = await ctx.db
    .query("users")
    .withIndex("by_role", (q) => q.eq("role", "admin"))
    .collect();

  return admins.filter((admin) => !isUnavailable(admin));
}

export async function escalateOverdueLoans(ctx: MutationCtx) {
  const today = todayUtc();
  const active = await loansWithStatus(ctx, "active");
  const overdue = active.filter((loan) => needsEscalation(loan, today));
  const admins = overdue.length > 0 ? await availableAdmins(ctx) : [];

  for (const loan of overdue) {
    const idempotencyKey = idempotencyKeys.overdueEscalated(loan._id);
    const now = Date.now();

    await ctx.db.patch("loans", loan._id, { escalatedAt: now, updatedAt: now });

    await recordAutomationEvent(ctx, {
      loanId: loan._id,
      idempotencyKey,
      eventType: "overdue_escalated",
      summary: `Escalated to admins after ${daysBetween(loan.endDate, today)} days overdue`,
    });

    for (const admin of admins) {
      await scheduleLoanEmail(ctx, {
        emailId: `${idempotencyKey}:${admin._id}`,
        kind: "overdue_escalation",
        loan,
        recipientId: admin._id,
      });
    }
  }

  return { escalated: overdue.length };
}
