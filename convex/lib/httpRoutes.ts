export const HTTP_ROUTES = {
  overdueLoans: "/api/n8n/overdue-loans",
  overdueReminderSent: "/api/n8n/reminder-sent",
  dueSoonLoans: "/api/n8n/due-soon-loans",
  dueSoonReminderSent: "/api/n8n/due-soon-sent",
  automationError: "/api/n8n/automation-error",
  clerkWebhook: "/clerk/webhook",
} as const;

export const SIGNATURE_HEADERS = {
  timestamp: "X-LendLoop-Timestamp",
  signature: "X-LendLoop-Signature",
} as const;
