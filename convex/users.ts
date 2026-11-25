import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import * as AccountClosure from "./model/accountClosure";
import { listRecentAuditEvents } from "./model/audit";
import { getAuthenticatedUser, requireAdmin } from "./model/auth";
import * as Moderation from "./model/moderation";
import * as Users from "./model/users";

export const syncCurrentUser = mutation({
  args: {},

  handler: async (ctx) => await Users.syncCurrentUser(ctx),
});

export const getCurrentUser = query({
  args: {},

  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    return user ? Users.toCurrentUser(user) : null;
  },
});

export const listUsersForAdmin = query({
  args: {},

  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await Users.listForAdmin(ctx);
  },
});

export const listAuditLogForAdmin = query({
  args: {},

  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await listRecentAuditEvents(ctx);
  },
});

export const setTrustedLender = mutation({
  args: { userId: v.id("users"), trustedLender: v.boolean() },

  handler: async (ctx, args) => await Moderation.setTrustedLender(ctx, args),
});

export const suspend = mutation({
  args: { userId: v.id("users"), reason: v.string() },

  handler: async (ctx, args) => await Moderation.suspend(ctx, args),
});

export const reinstate = mutation({
  args: { userId: v.id("users") },

  handler: async (ctx, { userId }) => await Moderation.reinstate(ctx, userId),
});

export const anonymizeDeletedAccount = internalMutation({
  args: { clerkId: v.string() },

  handler: async (ctx, { clerkId }) =>
    await AccountClosure.anonymizeDeletedAccount(ctx, clerkId),
});
