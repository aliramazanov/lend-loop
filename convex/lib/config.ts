import {
  millisecondsInMinute,
  millisecondsInSecond,
  secondsInMinute,
} from "date-fns/constants";

const BYTES_PER_KILOBYTE = 1024;

export const QUERY_LIMITS = {
  boardTools: 200,
  personalLoans: 100,
  adminLoans: 200,
  adminUsers: 200,
  removedListings: 50,
  auditLog: 25,
  workflowFailures: 15,
  loanActivity: 10,
  overviewScan: 2000,
} as const;

export const N8N_DELIVERY = {
  maxAttempts: 5,
  timeoutMs: 10 * millisecondsInSecond,
  firstRetryDelayMs: 30 * millisecondsInSecond,
  maxRetryDelayMs: 30 * millisecondsInMinute,
} as const;

export const SIGNATURE_POLICY = {
  replayWindowSeconds: 5 * secondsInMinute,
  minSecretLength: 32,
} as const;

export const HTTP_LIMITS = {
  n8nCallbackBodyBytes: 4 * BYTES_PER_KILOBYTE,
  clerkWebhookBodyBytes: 64 * BYTES_PER_KILOBYTE,
  executionIdLength: 100,
  automationSummaryLength: 240,
} as const;

export const CLERK_API_URL = "https://api.clerk.com/v1";

export const RESEND_API_URL = "https://api.resend.com/emails";

export const EMAIL_DELIVERY = {
  maxAttempts: 3,
  retryDelayMs: millisecondsInMinute,
} as const;
