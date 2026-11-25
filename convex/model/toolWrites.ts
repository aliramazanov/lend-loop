import { ConvexError } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { forbidden, notFound } from "../lib/errors";
import { enforceRateLimit } from "../lib/rateLimiter";
import { recordAudit } from "./audit";
import { requireUser } from "./auth";
import { bookedLoansForTool, loansForTool } from "./loanStore";
import { declineRequests } from "./loanTransitions";
import { validateToolInput } from "./toolInput";
import { assertValidPhotos, deleteDroppedPhotos } from "./toolPhotos";
import { assertCanAddListing, getActiveToolOrThrow } from "./toolStore";
import type { ToolFields } from "../types";

function canModerate(user: Doc<"users">, tool: Doc<"tools">): boolean {
  return user.role === "admin" || tool.ownerId === user._id;
}

export async function create(ctx: MutationCtx, fields: ToolFields) {
  const user = await requireUser(ctx);
  const text = validateToolInput(fields.name, fields.shortDescription);
  const photoIds = fields.photoIds ?? [];

  await enforceRateLimit(ctx, "listingWrite", user._id);
  await assertCanAddListing(ctx, user._id);
  await assertValidPhotos(ctx, photoIds);

  const now = Date.now();

  return await ctx.db.insert("tools", {
    ...text,
    ownerId: user._id,
    category: fields.category,
    condition: fields.condition,
    photoIds,
    createdAt: now,
    updatedAt: now,
  });
}

export async function update(
  ctx: MutationCtx,
  toolId: Id<"tools">,
  fields: ToolFields,
) {
  const user = await requireUser(ctx);
  const tool = await getActiveToolOrThrow(ctx, toolId);

  if (tool.ownerId !== user._id) {
    throw forbidden("You can only edit your own listings.");
  }

  const text = validateToolInput(fields.name, fields.shortDescription);
  const photoIds = fields.photoIds ?? tool.photoIds ?? [];

  await enforceRateLimit(ctx, "listingWrite", user._id);
  await assertValidPhotos(ctx, photoIds);

  await ctx.db.patch("tools", tool._id, {
    ...text,
    category: fields.category,
    condition: fields.condition,
    photoIds,
    updatedAt: Date.now(),
  });

  await deleteDroppedPhotos(ctx, {
    previous: tool.photoIds ?? [],
    kept: photoIds,
  });
}

export async function remove(ctx: MutationCtx, toolId: Id<"tools">) {
  const user = await requireUser(ctx);
  const tool = await getActiveToolOrThrow(ctx, toolId);
  const isOwner = tool.ownerId === user._id;

  if (!canModerate(user, tool)) {
    throw forbidden("Only the owner or an admin can delete this listing.");
  }

  await enforceRateLimit(ctx, "listingWrite", user._id);

  const booked = await bookedLoansForTool(ctx, tool._id);

  if (booked.length > 0) {
    throw new ConvexError(
      "This tool has an upcoming or active loan. Cancel or finish it first.",
    );
  }

  const pending = await loansForTool(ctx, tool._id, "pending");

  await declineRequests(ctx, pending, "loan_withdrawn");

  const now = Date.now();

  await ctx.db.patch("tools", tool._id, { archivedAt: now, updatedAt: now });

  await recordAudit(ctx, {
    actorId: user._id,
    action: isOwner ? "listing_deleted_by_owner" : "listing_removed_by_admin",
    targetType: "tool",
    targetId: tool._id,
    summary: `${user.name} removed "${tool.name}"`,
  });
}

export async function restore(ctx: MutationCtx, toolId: Id<"tools">) {
  const user = await requireUser(ctx);
  const tool = await ctx.db.get("tools", toolId);

  if (!tool?.archivedAt) throw notFound("Removed listing");

  if (!canModerate(user, tool)) {
    throw forbidden("Only the owner or an admin can restore this listing.");
  }

  const owner = await ctx.db.get("users", tool.ownerId);

  if (!owner || owner.suspendedAt || owner.deletedAt) {
    throw new ConvexError(
      "The owner's account is suspended or deleted, so this listing stays hidden.",
    );
  }

  await enforceRateLimit(ctx, "listingWrite", user._id);
  await assertCanAddListing(ctx, tool.ownerId);

  await ctx.db.patch("tools", tool._id, {
    archivedAt: undefined,
    updatedAt: Date.now(),
  });

  await recordAudit(ctx, {
    actorId: user._id,
    action: "listing_restored",
    targetType: "tool",
    targetId: tool._id,
    summary: `${user.name} restored "${tool.name}"`,
  });
}

export async function generatePhotoUploadUrl(ctx: MutationCtx) {
  const user = await requireUser(ctx);

  await enforceRateLimit(ctx, "photoUpload", user._id);

  return await ctx.storage.generateUploadUrl();
}
