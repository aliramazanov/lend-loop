/*
 * Public loan API used by the app. Each function is a thin wrapper; the checks on who may
 * act and in which state live in the model layer.
 *
 * requestBorrow, approve, decline, cancel: the request stage. A borrower asks for dates,
 * the owner answers, and either side can cancel until the tool changes hands.
 * confirmHandover, acknowledgeHandover, disputeHandover: the pickup, confirmed by one
 * neighbor and then agreed or disputed by the other.
 * claimReturn, confirmReturn, confirmReturnAsAdmin: the borrower says the tool is back, and
 * the owner (or an admin, when the owner is unavailable) closes the loan with its condition.
 * requestExtension, respondToExtension: asking the owner for more days.
 * listMyRequests, listIncomingRequests, countPendingIncoming, listAllForAdmin: the lists
 * behind My Requests, Incoming Requests, the nav badge and the admin Loans page.
 * expireStaleLoans, escalateOverdueLoans: background jobs run once a day.
 */

import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import {
  adminMutation,
  adminQuery,
  userMutation,
  userQuery,
} from "./lib/functions";
import { returnConditionValidator } from "./lib/validators";
import * as LoanAdmin from "./model/loanAdmin";
import * as LoanEscalation from "./model/loanEscalation";
import * as LoanExpiry from "./model/loanExpiry";
import * as LoanExtensions from "./model/loanExtensions";
import * as LoanHandshake from "./model/loanHandshake";
import * as LoanReads from "./model/loanReads";
import * as LoanRequests from "./model/loanRequests";
import * as LoanReturns from "./model/loanReturns";

const loanIdArgs = { loanId: v.id("loans") };

export const requestBorrow = userMutation({
  args: { toolId: v.id("tools"), startDate: v.string(), endDate: v.string() },

  handler: async (ctx, args) => await LoanRequests.requestBorrow(ctx, args),
});

export const approve = userMutation({
  args: loanIdArgs,

  handler: async (ctx, { loanId }) => await LoanRequests.approve(ctx, loanId),
});

export const decline = userMutation({
  args: loanIdArgs,

  handler: async (ctx, { loanId }) => await LoanRequests.decline(ctx, loanId),
});

export const cancel = userMutation({
  args: loanIdArgs,

  handler: async (ctx, { loanId }) => await LoanRequests.cancel(ctx, loanId),
});

export const confirmHandover = userMutation({
  args: loanIdArgs,

  handler: async (ctx, { loanId }) =>
    await LoanHandshake.confirmHandover(ctx, loanId),
});

export const acknowledgeHandover = userMutation({
  args: loanIdArgs,

  handler: async (ctx, { loanId }) =>
    await LoanHandshake.acknowledgeHandover(ctx, loanId),
});

export const disputeHandover = userMutation({
  args: loanIdArgs,

  handler: async (ctx, { loanId }) =>
    await LoanHandshake.disputeHandover(ctx, loanId),
});

export const claimReturn = userMutation({
  args: loanIdArgs,

  handler: async (ctx, { loanId }) =>
    await LoanReturns.claimReturn(ctx, loanId),
});

export const confirmReturn = userMutation({
  args: {
    loanId: v.id("loans"),
    condition: returnConditionValidator,
    note: v.optional(v.string()),
  },

  handler: async (ctx, report) => await LoanReturns.confirmReturn(ctx, report),
});

export const confirmReturnAsAdmin = adminMutation({
  args: {
    loanId: v.id("loans"),
    condition: returnConditionValidator,
    note: v.optional(v.string()),
  },

  handler: async (ctx, report) =>
    await LoanAdmin.confirmReturnForOwner(ctx, report),
});

export const requestExtension = userMutation({
  args: { loanId: v.id("loans"), endDate: v.string() },

  handler: async (ctx, args) =>
    await LoanExtensions.requestExtension(ctx, args),
});

export const respondToExtension = userMutation({
  args: { loanId: v.id("loans"), approve: v.boolean() },

  handler: async (ctx, args) =>
    await LoanExtensions.respondToExtension(ctx, args),
});

export const listMyRequests = userQuery({
  args: {},

  handler: async (ctx) => await LoanReads.byBorrower(ctx, ctx.user._id),
});

export const listIncomingRequests = userQuery({
  args: {},

  handler: async (ctx) => await LoanReads.forLender(ctx, ctx.user._id),
});

export const countPendingIncoming = userQuery({
  args: {},

  handler: async (ctx) =>
    await LoanReads.pendingCountForLender(ctx, ctx.user._id),
});

export const listAllForAdmin = adminQuery({
  args: {},

  handler: async (ctx) => await LoanReads.all(ctx),
});

export const expireStaleLoans = internalMutation({
  args: {},

  handler: async (ctx) => await LoanExpiry.expireStaleLoans(ctx),
});

export const escalateOverdueLoans = internalMutation({
  args: {},

  handler: async (ctx) => await LoanEscalation.escalateOverdueLoans(ctx),
});
