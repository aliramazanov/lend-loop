import { MutationCtx, QueryCtx } from "../_generated/server";
import { QUERY_LIMITS } from "../lib/config";
import type { AuditEntry, AuditEvent } from "../types";

export async function recordAudit(ctx: MutationCtx, entry: AuditEntry) {
  await ctx.db.insert("auditEvents", { ...entry, createdAt: Date.now() });
}

async function userName(ctx: QueryCtx, rawId: string) {
  const userId = ctx.db.normalizeId("users", rawId);
  const user = userId ? await ctx.db.get("users", userId) : null;

  return user?.name ?? "Removed account";
}

async function toolName(ctx: QueryCtx, rawId: string) {
  const toolId = ctx.db.normalizeId("tools", rawId);
  const tool = toolId ? await ctx.db.get("tools", toolId) : null;

  return tool?.name ?? "Deleted tool";
}

async function loanToolName(ctx: QueryCtx, rawId: string) {
  const loanId = ctx.db.normalizeId("loans", rawId);
  const loan = loanId ? await ctx.db.get("loans", loanId) : null;

  return loan ? await toolName(ctx, loan.toolId) : "Deleted loan";
}

async function targetName(ctx: QueryCtx, event: AuditEvent) {
  if (event.targetType === "user") return await userName(ctx, event.targetId);

  if (event.targetType === "tool") return await toolName(ctx, event.targetId);

  return await loanToolName(ctx, event.targetId);
}

async function toAuditView(ctx: QueryCtx, event: AuditEvent) {
  return {
    _id: event._id,
    action: event.action,
    actorName: await userName(ctx, event.actorId),
    targetName: await targetName(ctx, event),
    detail: event.detail ?? null,
    createdAt: event.createdAt,
  };
}

export async function listRecentAuditEvents(ctx: QueryCtx) {
  const events = await ctx.db
    .query("auditEvents")
    .order("desc")
    .take(QUERY_LIMITS.auditLog);

  return await Promise.all(events.map((event) => toAuditView(ctx, event)));
}
