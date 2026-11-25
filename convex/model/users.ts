import { UserIdentity } from "convex/server";
import { Doc } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { QUERY_LIMITS } from "../lib/config";
import { adminEmails } from "../lib/env";
import { unauthorized } from "../lib/errors";
import { normalizeText, stripHiddenCharacters } from "../lib/text";
import { PROFILE_POLICY } from "../shared/policy";
import { recordAudit } from "./audit";
import type { Role } from "../types";

const FALLBACK_NAME = "Neighbor";

function displayNameFor(identity: UserIdentity): string {
  const emailName = identity.email?.split("@")[0];
  const rawName = identity.name ?? identity.nickname ?? emailName ?? "";

  const name = normalizeText(stripHiddenCharacters(rawName)).slice(
    0,
    PROFILE_POLICY.maxDisplayNameLength,
  );

  return name || FALLBACK_NAME;
}

function roleFor(identity: UserIdentity): Role {
  const email = identity.email?.toLowerCase();
  const isVerified = identity.emailVerified === true;

  return email && isVerified && adminEmails().has(email) ? "admin" : "user";
}

async function auditRoleChange(
  ctx: MutationCtx,
  user: Pick<Doc<"users">, "_id" | "name">,
  role: Role,
) {
  const granted = role === "admin";

  await recordAudit(ctx, {
    actorId: user._id,
    action: granted ? "role_granted" : "role_revoked",
    targetType: "user",
    targetId: user._id,
    summary: `${user.name} ${granted ? "was granted" : "lost"} admin based on ADMIN_EMAILS`,
    detail: "Set by ADMIN_EMAILS",
  });
}

export async function syncCurrentUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) throw unauthorized();

  const name = displayNameFor(identity);
  const role = roleFor(identity);

  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!existing) {
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      name,
      role,
      trustedLender: false,
      createdAt: Date.now(),
    });

    if (role === "admin") {
      await auditRoleChange(ctx, { _id: userId, name }, role);
    }

    return userId;
  }

  if (existing.name !== name || existing.role !== role) {
    await ctx.db.patch("users", existing._id, { name, role });
  }

  if (existing.role !== role) {
    await auditRoleChange(ctx, { _id: existing._id, name }, role);
  }

  return existing._id;
}

export function toCurrentUser(user: Doc<"users">) {
  return {
    _id: user._id,
    name: user.name,
    role: user.role,
    trustedLender: user.trustedLender,
    suspended: Boolean(user.suspendedAt),
  };
}

export async function listForAdmin(ctx: QueryCtx) {
  const users = await ctx.db.query("users").take(QUERY_LIMITS.adminUsers);

  return users.map((user) => ({
    _id: user._id,
    name: user.name,
    role: user.role,
    trustedLender: user.trustedLender,
    suspended: Boolean(user.suspendedAt),
    suspendedReason: user.suspendedReason ?? null,
    deleted: Boolean(user.deletedAt),
    createdAt: user.createdAt,
  }));
}
