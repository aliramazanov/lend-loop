import { ConvexError } from "convex/values";
import { Doc } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";
import { forbidden, unauthorized } from "../lib/errors";

export async function getAuthenticatedUser(
  ctx: QueryCtx,
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

export async function requireUser(ctx: QueryCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) throw unauthorized();

  const user = await getAuthenticatedUser(ctx);

  if (!user) {
    throw new ConvexError(
      "User profile not initialized. Please wait for sync or refresh.",
    );
  }

  if (user.deletedAt) {
    throw new ConvexError("This account was deleted.");
  }

  if (user.suspendedAt) {
    throw new ConvexError(
      "Your account is suspended. Contact a LendLoop admin.",
    );
  }

  return user;
}

export async function requireAdmin(ctx: QueryCtx): Promise<Doc<"users">> {
  const user = await requireUser(ctx);

  if (user.role !== "admin") throw forbidden("Admin role required.");

  return user;
}
