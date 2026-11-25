import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { returnConditionValidator } from "./lib/validators";
import { requireAdmin, requireUser } from "./model/auth";
import * as LoanAdmin from "./model/loanAdmin";
import * as LoanEscalation from "./model/loanEscalation";
import * as LoanExpiry from "./model/loanExpiry";
import * as LoanExtensions from "./model/loanExtensions";
import * as LoanHandshake from "./model/loanHandshake";
import * as LoanReads from "./model/loanReads";
import * as LoanRequests from "./model/loanRequests";
import * as LoanReturns from "./model/loanReturns";

const loanIdArgs = { loanId: v.id("loans") };

export const requestBorrow = mutation({
  args: { toolId: v.id("tools"), startDate: v.string(), endDate: v.string() },

  handler: async (ctx, args) => await LoanRequests.requestBorrow(ctx, args),
});

export const approve = mutation({
  args: loanIdArgs,

  handler: async (ctx, { loanId }) => await LoanRequests.approve(ctx, loanId),
});

export const decline = mutation({
  args: loanIdArgs,

  handler: async (ctx, { loanId }) => await LoanRequests.decline(ctx, loanId),
});

export const cancel = mutation({
  args: loanIdArgs,

  handler: async (ctx, { loanId }) => await LoanRequests.cancel(ctx, loanId),
});

export const confirmHandover = mutation({
  args: loanIdArgs,

  handler: async (ctx, { loanId }) =>
    await LoanHandshake.confirmHandover(ctx, loanId),
});

export const acknowledgeHandover = mutation({
  args: loanIdArgs,

  handler: async (ctx, { loanId }) =>
    await LoanHandshake.acknowledgeHandover(ctx, loanId),
});

export const disputeHandover = mutation({
  args: loanIdArgs,

  handler: async (ctx, { loanId }) =>
    await LoanHandshake.disputeHandover(ctx, loanId),
});

export const claimReturn = mutation({
  args: loanIdArgs,

  handler: async (ctx, { loanId }) =>
    await LoanReturns.claimReturn(ctx, loanId),
});

export const confirmReturn = mutation({
  args: {
    loanId: v.id("loans"),
    condition: returnConditionValidator,
    note: v.optional(v.string()),
  },

  handler: async (ctx, report) => await LoanReturns.confirmReturn(ctx, report),
});

export const confirmReturnAsAdmin = mutation({
  args: {
    loanId: v.id("loans"),
    condition: returnConditionValidator,
    note: v.optional(v.string()),
  },

  handler: async (ctx, report) =>
    await LoanAdmin.confirmReturnForOwner(ctx, report),
});

export const requestExtension = mutation({
  args: { loanId: v.id("loans"), endDate: v.string() },

  handler: async (ctx, args) =>
    await LoanExtensions.requestExtension(ctx, args),
});

export const respondToExtension = mutation({
  args: { loanId: v.id("loans"), approve: v.boolean() },

  handler: async (ctx, args) =>
    await LoanExtensions.respondToExtension(ctx, args),
});

export const listMyRequests = query({
  args: {},

  handler: async (ctx) => {
    const user = await requireUser(ctx);

    return await LoanReads.byBorrower(ctx, user._id);
  },
});

export const listIncomingRequests = query({
  args: {},

  handler: async (ctx) => {
    const user = await requireUser(ctx);

    return await LoanReads.forLender(ctx, user._id);
  },
});

export const countPendingIncoming = query({
  args: {},

  handler: async (ctx) => {
    const user = await requireUser(ctx);

    return await LoanReads.pendingCountForLender(ctx, user._id);
  },
});

export const listAllForAdmin = query({
  args: {},

  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await LoanReads.all(ctx);
  },
});

export const expireStaleLoans = internalMutation({
  args: {},

  handler: async (ctx) => await LoanExpiry.expireStaleLoans(ctx),
});

export const escalateOverdueLoans = internalMutation({
  args: {},

  handler: async (ctx) => await LoanEscalation.escalateOverdueLoans(ctx),
});
