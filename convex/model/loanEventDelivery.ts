import { v } from "convex/values";
import { internal } from "../_generated/api";
import { ActionCtx } from "../_generated/server";
import { HTTP_LIMITS, N8N_DELIVERY } from "../lib/config";
import { unixSeconds } from "../lib/dates";
import { n8nWebhookTarget } from "../lib/env";
import { idempotencyKeys } from "../lib/events";
import { formatSignature, signHmacSha256 } from "../lib/hmac";
import { SIGNATURE_HEADERS } from "../lib/httpRoutes";
import { loanEventValidator } from "../lib/validators";
import type { DeliveryResult, LoanEventPayload, WebhookTarget } from "../types";

export const loanEventPayload = v.object({
  eventId: v.string(),
  eventType: loanEventValidator,
  loanId: v.id("loans"),
  toolName: v.string(),
  status: v.string(),
  startDate: v.string(),
  endDate: v.string(),
  recipientName: v.string(),
});

function retryDelayMs(attempt: number): number {
  const exponential = N8N_DELIVERY.firstRetryDelayMs * 2 ** attempt;

  return Math.min(exponential, N8N_DELIVERY.maxRetryDelayMs);
}

function failureSummary(event: LoanEventPayload, reason: string): string {
  const summary = `Request notification (${event.eventType}) failed after ${N8N_DELIVERY.maxAttempts} attempts: ${reason}`;

  return summary.slice(0, HTTP_LIMITS.automationSummaryLength);
}

async function postSignedEvent(
  target: WebhookTarget,
  event: LoanEventPayload,
): Promise<DeliveryResult> {
  const payload = JSON.stringify(event);
  const timestamp = String(unixSeconds());
  const signature = await signHmacSha256(target.secret, timestamp, payload);

  try {
    const response = await fetch(target.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [SIGNATURE_HEADERS.timestamp]: timestamp,
        [SIGNATURE_HEADERS.signature]: formatSignature(signature),
      },
      body: JSON.stringify({ payload }),
      signal: AbortSignal.timeout(N8N_DELIVERY.timeoutMs),
    });

    return response.ok
      ? { ok: true }
      : { ok: false, reason: `n8n responded with HTTP ${response.status}` };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function deliverLoanEvent(
  ctx: ActionCtx,
  { attempt, ...event }: LoanEventPayload & { attempt: number },
): Promise<void> {
  const record = internal.n8n.recordAutomationEvent;
  const target = n8nWebhookTarget();

  if (!target) {
    await ctx.runMutation(record, {
      loanId: event.loanId,
      idempotencyKey: idempotencyKeys.deliverySkipped(event.eventId),
      eventType: "webhook_skipped",
      summary: `Notification skipped: n8n is not configured (${event.status})`,
    });

    return;
  }

  const delivery = await postSignedEvent(target, event);

  if (delivery.ok) {
    await ctx.runMutation(record, {
      loanId: event.loanId,
      idempotencyKey: idempotencyKeys.delivered(event.eventId),
      eventType: event.eventType,
      summary: `Notification sent (${event.status})`,
    });

    return;
  }

  const nextAttempt = attempt + 1;

  if (nextAttempt < N8N_DELIVERY.maxAttempts) {
    await ctx.scheduler.runAfter(
      retryDelayMs(attempt),
      internal.n8n.deliverLoanEvent,
      { ...event, attempt: nextAttempt },
    );

    return;
  }

  await ctx.runMutation(record, {
    loanId: event.loanId,
    idempotencyKey: idempotencyKeys.deliveryFailed(event.eventId),
    eventType: "workflow_error",
    summary: failureSummary(event, delivery.reason),
  });
}
