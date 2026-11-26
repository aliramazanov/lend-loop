/*
 * Listing reads for each audience: visitors, signed-in neighbors, owners and admins.
 * Removed listings appear only for their owner and for admins.
 */

import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";
import { QUERY_LIMITS } from "../lib/config";
import { todayUtc } from "../lib/dates";
import { isToolOnLoan } from "./loanStore";
import {
  isArchived,
  isListed,
  listBoardTools,
  listOwnedTools,
} from "./toolStore";
import {
  toBoardTool,
  toOwnListing,
  toPublicTool,
  toRemovedListing,
  toToolDetails,
} from "./toolViews";
import type { Category, Viewer } from "../types";

export async function publicBoard(ctx: QueryCtx) {
  const today = todayUtc();
  const tools = await listBoardTools(ctx);

  const onLoan = await Promise.all(
    tools.map((tool) => isToolOnLoan(ctx, tool._id, today)),
  );

  return tools
    .filter((_, index) => !onLoan[index])
    .map((tool) => toPublicTool(tool));
}

export async function board(
  ctx: QueryCtx,
  viewer: Viewer,
  category?: Category,
) {
  const tools = await listBoardTools(ctx, category);

  return await Promise.all(tools.map((tool) => toBoardTool(ctx, tool, viewer)));
}

export async function ownListings(ctx: QueryCtx, ownerId: Id<"users">) {
  const owned = await listOwnedTools(ctx, ownerId);

  return await Promise.all(
    owned.filter(isListed).map((tool) => toOwnListing(ctx, tool)),
  );
}

export async function ownListing(
  ctx: QueryCtx,
  ownerId: Id<"users">,
  rawToolId: string,
) {
  const toolId = ctx.db.normalizeId("tools", rawToolId);
  const tool = toolId ? await ctx.db.get("tools", toolId) : null;

  if (!tool || tool.ownerId !== ownerId || isArchived(tool)) return null;

  return await toOwnListing(ctx, tool);
}

export async function removedByOwner(ctx: QueryCtx, ownerId: Id<"users">) {
  const owned = await listOwnedTools(ctx, ownerId);

  return owned
    .filter(isArchived)
    .slice(0, QUERY_LIMITS.removedListings)
    .map((tool) => toRemovedListing(tool));
}

export async function removedForAdmin(ctx: QueryCtx) {
  const removed = await ctx.db
    .query("tools")
    .withIndex("by_archived", (q) => q.gt("archivedAt", 0))
    .order("desc")
    .take(QUERY_LIMITS.removedListings);

  return await Promise.all(
    removed.map(async (tool) => {
      const owner = await ctx.db.get("users", tool.ownerId);

      return toRemovedListing(tool, owner?.name ?? "Neighbor");
    }),
  );
}

export async function details(
  ctx: QueryCtx,
  viewer: Viewer,
  rawToolId: string,
) {
  const toolId = ctx.db.normalizeId("tools", rawToolId);
  const tool = toolId ? await ctx.db.get("tools", toolId) : null;

  if (!tool) return null;

  const canSeeArchived = tool.ownerId === viewer._id || viewer.role === "admin";

  if (isArchived(tool) && !canSeeArchived) return null;

  return await toToolDetails(ctx, tool, viewer);
}
