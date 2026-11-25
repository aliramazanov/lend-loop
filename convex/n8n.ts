import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { automationEventValidator } from "./lib/validators";
import { requireAdmin } from "./model/auth";
import * as Automation from "./model/automation";
import * as LoanEventDelivery from "./model/loanEventDelivery";
import * as Reminders from "./model/reminders";

export const deliverLoanEvent = internalAction({
  args: { ...LoanEventDelivery.loanEventPayload.fields, attempt: v.number() },

  handler: async (ctx, args): Promise<void> =>
    await LoanEventDelivery.deliverLoanEvent(ctx, args),
});

export const recordAutomationEvent = internalMutation({
  args: {
    loanId: v.optional(v.id("loans")),
    idempotencyKey: v.string(),
    eventType: automationEventValidator,
    summary: v.string(),
  },

  handler: async (ctx, record) =>
    await Automation.recordAutomationEvent(ctx, record),
});

export const listOverdueLoans = internalQuery({
  args: { today: v.string() },

  handler: async (ctx, { today }) => await Reminders.listOverdue(ctx, today),
});

export const listDueSoonLoans = internalQuery({
  args: { tomorrow: v.string() },

  handler: async (ctx, { tomorrow }) =>
    await Reminders.listDueSoon(ctx, tomorrow),
});

export const recordOverdueReminder = internalMutation({
  args: { loanId: v.string(), today: v.string() },

  handler: async (ctx, args) =>
    await Reminders.recordOverdueReminder(ctx, args),
});

export const recordDueSoonReminder = internalMutation({
  args: { loanId: v.string(), tomorrow: v.string() },

  handler: async (ctx, args) =>
    await Reminders.recordDueSoonReminder(ctx, args),
});

export const recordWorkflowError = internalMutation({
  args: {
    executionId: v.string(),
    summary: v.string(),
    loanId: v.optional(v.string()),
  },

  handler: async (ctx, report) =>
    await Automation.recordWorkflowError(ctx, report),
});

export const listWorkflowFailuresForAdmin = query({
  args: {},

  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await Automation.listWorkflowFailures(ctx);
  },
});
