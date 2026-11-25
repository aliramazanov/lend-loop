import { v } from "convex/values";
import { internal } from "../_generated/api";
import { ActionCtx } from "../_generated/server";
import { CLERK_API_URL, EMAIL_DELIVERY, RESEND_API_URL } from "../lib/config";
import { clerkSecretKey, resendConfig } from "../lib/env";
import { idempotencyKeys } from "../lib/events";
import { objectField, stringField } from "../lib/httpResponses";
import { emailKindValidator } from "../lib/validators";
import { composeEmail } from "./emailMessages";
import type { EmailMessage, LoanEmail } from "../types";

export const loanEmailPayload = v.object({
  emailId: v.string(),
  kind: emailKindValidator,
  loanId: v.id("loans"),
  recipientId: v.id("users"),
  toolName: v.string(),
  startDate: v.string(),
  endDate: v.string(),
});

function primaryEmail(clerkUser: object | null): string | undefined {
  const primaryId = stringField(clerkUser, "primary_email_address_id");

  const addresses: unknown = clerkUser
    ? Reflect.get(clerkUser, "email_addresses")
    : undefined;

  if (!Array.isArray(addresses)) return undefined;

  const primary: unknown = addresses.find(
    (address: unknown) =>
      typeof address === "object" &&
      address !== null &&
      stringField(address, "id") === primaryId,
  );

  return typeof primary === "object" && primary !== null
    ? stringField(primary, "email_address")
    : undefined;
}

async function emailAddressOf(clerkId: string): Promise<string | undefined> {
  const secretKey = clerkSecretKey();

  if (!secretKey) return undefined;

  const response = await fetch(
    `${CLERK_API_URL}/users/${encodeURIComponent(clerkId)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  );

  if (!response.ok) return undefined;

  const body: unknown = await response.json();

  return primaryEmail(objectField({ body }, "body"));
}

async function sendViaResend(
  email: LoanEmail,
  to: string,
  message: EmailMessage,
): Promise<boolean> {
  const config = resendConfig();

  if (!config) return false;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": email.emailId,
    },
    body: JSON.stringify({ from: config.from, to: [to], ...message }),
  });

  return response.ok;
}

export async function deliverLoanEmail(
  ctx: ActionCtx,
  { attempt, ...email }: LoanEmail & { attempt: number },
): Promise<void> {
  if (!resendConfig()) return;

  const recipient = await ctx.runQuery(internal.emails.recipientOf, {
    userId: email.recipientId,
  });

  const address = recipient
    ? await emailAddressOf(recipient.clerkId)
    : undefined;

  if (!address) return;

  const message = composeEmail(email.kind, email);
  const delivered = await sendViaResend(email, address, message);
  const record = internal.n8n.recordAutomationEvent;

  if (delivered) {
    await ctx.runMutation(record, {
      loanId: email.loanId,
      idempotencyKey: idempotencyKeys.emailSent(email.emailId),
      eventType: "email_sent",
      summary: `Email sent: ${message.subject}`,
    });

    return;
  }

  if (attempt + 1 < EMAIL_DELIVERY.maxAttempts) {
    await ctx.scheduler.runAfter(
      EMAIL_DELIVERY.retryDelayMs,
      internal.emails.sendLoanEmail,
      { ...email, attempt: attempt + 1 },
    );

    return;
  }

  await ctx.runMutation(record, {
    loanId: email.loanId,
    idempotencyKey: idempotencyKeys.emailFailed(email.emailId),
    eventType: "email_failed",
    summary: `Email failed after ${EMAIL_DELIVERY.maxAttempts} attempts: ${message.subject}`,
  });
}
