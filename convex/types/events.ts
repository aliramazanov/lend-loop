import type {
  AUDIT_ACTIONS,
  AUTOMATION_EVENTS,
  EMAIL_KINDS,
  LOAN_EVENTS,
} from "../lib/events";

export type LoanEvent = (typeof LOAN_EVENTS)[number];

export type AutomationEventType = (typeof AUTOMATION_EVENTS)[number];

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export type EmailKind = (typeof EMAIL_KINDS)[number];
