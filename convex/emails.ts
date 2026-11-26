/*
 * Email sending, scheduled after loan changes and reminders.
 *
 * sendLoanEmail: sends one email through Resend and retries a few times before giving up.
 * The outcome shows in the loan's activity log.
 * recipientOf: the recipient's Clerk id, or nothing for a deleted account, which gets no email.
 */

import { v } from "convex/values";
import { internalAction, internalQuery } from "./_generated/server";
import * as EmailDelivery from "./model/emailDelivery";

export const sendLoanEmail = internalAction({
  args: { ...EmailDelivery.loanEmailPayload.fields, attempt: v.number() },

  handler: async (ctx, args): Promise<void> =>
    await EmailDelivery.deliverLoanEmail(ctx, args),
});

export const recipientOf = internalQuery({
  args: { userId: v.id("users") },

  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get("users", userId);

    if (!user || user.deletedAt) return null;

    return { clerkId: user.clerkId };
  },
});
