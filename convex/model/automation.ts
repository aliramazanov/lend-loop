import { Doc } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { QUERY_LIMITS } from "../lib/config";
import { idempotencyKeys } from "../lib/events";
import type {
  AutomationEventType,
  AutomationRecord,
  RecordWorkflowErrorArgs,
} from "../types";

function reminderFields(
  eventType: AutomationEventType,
  now: number,
): Partial<Doc<"loans">> {
  if (eventType === "overdue_reminder") return { lastReminderAt: now };

  if (eventType === "due_soon_reminder") return { dueSoonReminderAt: now };

  return {};
}

async function findByIdempotencyKey(ctx: QueryCtx, idempotencyKey: string) {
  return await ctx.db
    .query("automationEvents")
    .withIndex("by_idempotency_key", (q) =>
      q.eq("idempotencyKey", idempotencyKey),
    )
    .unique();
}

async function updateLoanSummary(
  ctx: MutationCtx,
  record: AutomationRecord,
  now: number,
) {
  const loan = record.loanId ? await ctx.db.get("loans", record.loanId) : null;

  if (!loan) return;

  await ctx.db.patch("loans", loan._id, {
    ...reminderFields(record.eventType, now),
    lastAutomationSummary: record.summary,
    updatedAt: now,
  });
}

export async function recordAutomationEvent(
  ctx: MutationCtx,
  record: AutomationRecord,
) {
  const existing = await findByIdempotencyKey(ctx, record.idempotencyKey);

  if (existing) {
    return { deduplicated: true, eventId: existing._id };
  }

  const now = Date.now();

  await updateLoanSummary(ctx, record, now);

  const eventId = await ctx.db.insert("automationEvents", {
    ...record,
    createdAt: now,
  });

  return { deduplicated: false, eventId };
}

export async function recordWorkflowError(
  ctx: MutationCtx,
  report: RecordWorkflowErrorArgs,
) {
  const loanId = report.loanId
    ? ctx.db.normalizeId("loans", report.loanId)
    : null;

  return await recordAutomationEvent(ctx, {
    loanId: loanId ?? undefined,
    idempotencyKey: idempotencyKeys.workflowError(report.executionId),
    eventType: "workflow_error",
    summary: report.summary,
  });
}

export async function listWorkflowFailures(ctx: QueryCtx) {
  const failures = await ctx.db
    .query("automationEvents")
    .withIndex("by_event_type", (q) => q.eq("eventType", "workflow_error"))
    .order("desc")
    .take(QUERY_LIMITS.workflowFailures);

  return failures.map((failure) => ({
    _id: failure._id,
    eventType: failure.eventType,
    summary: failure.summary,
    createdAt: failure.createdAt,
  }));
}
