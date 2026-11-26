/*
 * Account API used by the app and by the Clerk webhook.
 *
 * syncCurrentUser, getCurrentUser: keep the neighbor's record in step with their Clerk
 * profile and return it, including role, trust label and suspension.
 * listUsersForAdmin, listAuditLogForAdmin: the admin Neighbors and Audit log pages.
 * setTrustedLender, suspend, reinstate: admin moderation. Each change is written to the
 * audit log, and suspension also signs the neighbor out through Clerk.
 * anonymizeDeletedAccount: run when Clerk reports a deleted account. Their name is
 * replaced, their listings are hidden and their unstarted loans are closed.
 */

import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import {
  adminMutation,
  adminQuery,
  publicQuery,
  signedInMutation,
} from "./lib/functions";
import * as AccountClosure from "./model/accountClosure";
import { listRecentAuditEvents } from "./model/audit";
import { getAuthenticatedUser } from "./model/auth";
import * as Moderation from "./model/moderation";
import * as Users from "./model/users";

export const syncCurrentUser = signedInMutation({
  args: {},

  handler: async (ctx) => await Users.syncCurrentUser(ctx),
});

export const getCurrentUser = publicQuery({
  args: {},

  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    return user ? Users.toCurrentUser(user) : null;
  },
});

export const listUsersForAdmin = adminQuery({
  args: {},

  handler: async (ctx) => await Users.listForAdmin(ctx),
});

export const listAuditLogForAdmin = adminQuery({
  args: {},

  handler: async (ctx) => await listRecentAuditEvents(ctx),
});

export const setTrustedLender = adminMutation({
  args: { userId: v.id("users"), trustedLender: v.boolean() },

  handler: async (ctx, args) => await Moderation.setTrustedLender(ctx, args),
});

export const suspend = adminMutation({
  args: { userId: v.id("users"), reason: v.string() },

  handler: async (ctx, args) => await Moderation.suspend(ctx, args),
});

export const reinstate = adminMutation({
  args: { userId: v.id("users") },

  handler: async (ctx, { userId }) => await Moderation.reinstate(ctx, userId),
});

export const anonymizeDeletedAccount = internalMutation({
  args: { clerkId: v.string() },

  handler: async (ctx, { clerkId }) =>
    await AccountClosure.anonymizeDeletedAccount(ctx, clerkId),
});
