import type { Id } from "../_generated/dataModel";
import type { loanEventPayload } from "../model/loanEventDelivery";
import type { AutomationEventType } from "./events";
import type { Infer } from "convex/values";

export interface AutomationRecord {
  loanId?: Id<"loans">;
  idempotencyKey: string;
  eventType: AutomationEventType;
  summary: string;
}

export interface RecordWorkflowErrorArgs {
  executionId: string;
  summary: string;
  loanId?: string;
}

export type LoanEventPayload = Infer<typeof loanEventPayload>;

export type DeliveryResult = { ok: true } | { ok: false; reason: string };

export interface WebhookTarget {
  url: string;
  secret: string;
}

export interface RecordOverdueReminderArgs {
  loanId: string;
  today: string;
}

export interface RecordDueSoonReminderArgs {
  loanId: string;
  tomorrow: string;
}
