import { ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";
import { QUERY_LIMITS } from "../lib/config";
import { notFound } from "../lib/errors";
import { LISTING_POLICY } from "../shared/policy";
import type { Category, Tool } from "../types";

export function isArchived(tool: Tool): boolean {
  return tool.archivedAt !== undefined;
}

export function isListed(tool: Tool): boolean {
  return !isArchived(tool);
}

export async function getActiveToolOrThrow(ctx: QueryCtx, toolId: Id<"tools">) {
  const tool = await ctx.db.get("tools", toolId);

  if (!tool || isArchived(tool)) {
    throw notFound("Tool");
  }

  return tool;
}

export async function listBoardTools(ctx: QueryCtx, category?: Category) {
  const listed = category
    ? ctx.db
        .query("tools")
        .withIndex("by_archived_category", (q) =>
          q.eq("archivedAt", undefined).eq("category", category),
        )
    : ctx.db
        .query("tools")
        .withIndex("by_archived", (q) => q.eq("archivedAt", undefined));

  return await listed.order("desc").take(QUERY_LIMITS.boardTools);
}

export async function listOwnedTools(ctx: QueryCtx, ownerId: Id<"users">) {
  return await ctx.db
    .query("tools")
    .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
    .order("desc")
    .collect();
}

export async function assertCanAddListing(ctx: QueryCtx, ownerId: Id<"users">) {
  const owned = await listOwnedTools(ctx, ownerId);
  const activeCount = owned.filter(isListed).length;

  if (activeCount >= LISTING_POLICY.maxActivePerOwner) {
    throw new ConvexError(
      `You can have at most ${LISTING_POLICY.maxActivePerOwner} active listings.`,
    );
  }
}
