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
