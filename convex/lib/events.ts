export const LOAN_EVENTS = [
  "loan_requested",
  "loan_approved",
  "loan_declined",
  "loan_withdrawn",
  "loan_cancelled",
  "loan_handed_over",
  "loan_handover_disputed",
  "loan_return_claimed",
  "loan_returned",
  "loan_expired",
  "loan_extension_requested",
  "loan_extension_approved",
  "loan_extension_declined",
] as const;

export const AUTOMATION_EVENTS = [
  ...LOAN_EVENTS,
  "overdue_reminder",
  "due_soon_reminder",
  "webhook_skipped",
  "workflow_error",
  "email_sent",
  "email_failed",
  "overdue_escalated",
] as const;

export const EMAIL_KINDS = [
  ...LOAN_EVENTS,
  "overdue_reminder",
  "due_soon_reminder",
  "overdue_escalation",
] as const;

export const AUDIT_ACTIONS = [
  "listing_deleted_by_owner",
  "listing_removed_by_admin",
  "listing_restored",
  "loan_issue_reported",
  "loan_closed_by_admin",
  "handover_disputed",
  "role_granted",
  "role_revoked",
  "trusted_lender_granted",
  "trusted_lender_revoked",
  "user_suspended",
  "user_reinstated",
  "account_deleted",
] as const;

export type LoanEvent = (typeof LOAN_EVENTS)[number];

export type AutomationEventType = (typeof AUTOMATION_EVENTS)[number];

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export type EmailKind = (typeof EMAIL_KINDS)[number];

export function loanEventId(loanId: string, event: LoanEvent, at: number) {
  return `${loanId}:${event}:${at}`;
}

export const idempotencyKeys = {
  delivered: (eventId: string) => `dispatch:${eventId}`,
  deliveryFailed: (eventId: string) => `failed:${eventId}`,
  deliverySkipped: (eventId: string) => `skipped:${eventId}`,
  overdueReminder: (loanId: string, date: string) =>
    `reminder:${loanId}:${date}`,
  dueSoonReminder: (loanId: string, endDate: string) =>
    `due_soon:${loanId}:${endDate}`,
  workflowError: (executionId: string) => `n8n_error:${executionId}`,
  emailSent: (emailId: string) => `email_sent:${emailId}`,
  emailFailed: (emailId: string) => `email_failed:${emailId}`,
  overdueEscalated: (loanId: string) => `overdue_escalated:${loanId}`,
};
