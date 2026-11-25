import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  auditActionValidator,
  automationEventValidator,
  categoryValidator,
  conditionValidator,
  loanPartyValidator,
  loanStatusValidator,
  returnConditionValidator,
  roleValidator,
} from "./lib/validators";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    role: roleValidator,
    trustedLender: v.boolean(),
    suspendedAt: v.optional(v.number()),
    suspendedReason: v.optional(v.string()),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"]),

  tools: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    category: categoryValidator,
    condition: conditionValidator,
    shortDescription: v.string(),
    photoIds: v.optional(v.array(v.id("_storage"))),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_archived", ["archivedAt"])
    .index("by_archived_category", ["archivedAt", "category"]),

  loans: defineTable({
    toolId: v.id("tools"),
    lenderId: v.id("users"),
    borrowerId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
    status: loanStatusValidator,
    lastReminderAt: v.optional(v.number()),
    dueSoonReminderAt: v.optional(v.number()),
    handedOverAt: v.optional(v.number()),
    handoverConfirmedBy: v.optional(loanPartyValidator),
    handoverAcknowledgedAt: v.optional(v.number()),
    escalatedAt: v.optional(v.number()),
    returnClaimedAt: v.optional(v.number()),
    returnedAt: v.optional(v.number()),
    returnCondition: v.optional(returnConditionValidator),
    returnNote: v.optional(v.string()),
    extensionEndDate: v.optional(v.string()),
    lastAutomationSummary: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tool_status", ["toolId", "status"])
    .index("by_lender", ["lenderId"])
    .index("by_borrower", ["borrowerId"])
    .index("by_status", ["status"]),

  automationEvents: defineTable({
    loanId: v.optional(v.id("loans")),
    idempotencyKey: v.string(),
    eventType: automationEventValidator,
    summary: v.string(),
    createdAt: v.number(),
  })
    .index("by_loan", ["loanId"])
    .index("by_event_type", ["eventType"])
    .index("by_idempotency_key", ["idempotencyKey"]),

  auditEvents: defineTable({
    actorId: v.id("users"),
    action: auditActionValidator,
    targetType: v.union(
      v.literal("tool"),
      v.literal("user"),
      v.literal("loan"),
    ),
    targetId: v.string(),
    summary: v.string(),
    detail: v.optional(v.string()),
    createdAt: v.number(),
  }),
});
