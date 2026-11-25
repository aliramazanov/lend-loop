import { ConvexError } from "convex/values";
import { internal } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { notFound } from "../lib/errors";
import { enforceRateLimit } from "../lib/rateLimiter";
import {
  isLengthWithin,
  normalizeText,
  stripHiddenCharacters,
} from "../lib/text";
import { MODERATION_POLICY } from "../shared/policy";
import { closeOpenLoans, hideListings } from "./accountClosure";
import { recordAudit } from "./audit";
import { requireAdmin } from "./auth";

const { suspensionReasonLength } = MODERATION_POLICY;

async function requireModerationTarget(ctx: MutationCtx, userId: Id<"users">) {
  const admin = await requireAdmin(ctx);

  await enforceRateLimit(ctx, "adminAction", admin._id);

  const target = await ctx.db.get("users", userId);

  if (!target) throw notFound("User");

  if (target.deletedAt) {
    throw new ConvexError("This account was deleted.");
  }

  return { admin, target };
}

function assertCanSuspend(admin: Doc<"users">, target: Doc<"users">) {
  if (target._id === admin._id) {
    throw new ConvexError("You can't suspend yourself.");
  }

  if (target.role === "admin") {
    throw new ConvexError(
      "Admins can't be suspended. Remove them from ADMIN_EMAILS first.",
    );
  }

  if (target.suspendedAt) {
    throw new ConvexError("This user is already suspended.");
  }
}

function cleanReason(rawReason: string): string {
  const reason = normalizeText(stripHiddenCharacters(rawReason));

  if (!isLengthWithin(reason, suspensionReasonLength)) {
    throw new ConvexError(
      `Give a reason between ${suspensionReasonLength.min} and ${suspensionReasonLength.max} characters.`,
    );
  }

  return reason;
}

async function scheduleClerkBan(
  ctx: MutationCtx,
  clerkId: string,
  banned: boolean,
) {
  await ctx.scheduler.runAfter(0, internal.clerk.setBanned, {
    clerkId,
    banned,
  });
}

export async function setTrustedLender(
  ctx: MutationCtx,
  { userId, trustedLender }: { userId: Id<"users">; trustedLender: boolean },
) {
  const { admin, target } = await requireModerationTarget(ctx, userId);

  if (trustedLender && target.suspendedAt) {
    throw new ConvexError("A suspended neighbor can't be a trusted lender.");
  }

  await ctx.db.patch("users", target._id, { trustedLender });

  await recordAudit(ctx, {
    actorId: admin._id,
    action: trustedLender ? "trusted_lender_granted" : "trusted_lender_revoked",
    targetType: "user",
    targetId: target._id,
    summary: `${admin.name} ${trustedLender ? "marked" : "unmarked"} ${target.name} as a trusted lender`,
  });
}

export async function suspend(
  ctx: MutationCtx,
  { userId, reason: rawReason }: { userId: Id<"users">; reason: string },
) {
  const { admin, target } = await requireModerationTarget(ctx, userId);
  const reason = cleanReason(rawReason);

  assertCanSuspend(admin, target);

  await ctx.db.patch("users", target._id, {
    suspendedAt: Date.now(),
    suspendedReason: reason,
    trustedLender: false,
  });

  const closedLoans = await closeOpenLoans(ctx, target._id);
  const hiddenListings = await hideListings(ctx, target._id);

  await recordAudit(ctx, {
    actorId: admin._id,
    action: "user_suspended",
    targetType: "user",
    targetId: target._id,
    summary: `${admin.name} suspended ${target.name}: ${reason} (${hiddenListings} listings hidden, ${closedLoans} loans closed)`,
    detail: `${reason} (${hiddenListings} listings hidden, ${closedLoans} loans closed)`,
  });

  await scheduleClerkBan(ctx, target.clerkId, true);

  return { hiddenListings, closedLoans };
}

export async function reinstate(ctx: MutationCtx, userId: Id<"users">) {
  const { admin, target } = await requireModerationTarget(ctx, userId);

  if (!target.suspendedAt) {
    throw new ConvexError("This user isn't suspended.");
  }

  await ctx.db.patch("users", target._id, {
    suspendedAt: undefined,
    suspendedReason: undefined,
  });

  await recordAudit(ctx, {
    actorId: admin._id,
    action: "user_reinstated",
    targetType: "user",
    targetId: target._id,
    summary: `${admin.name} reinstated ${target.name}`,
  });

  await scheduleClerkBan(ctx, target.clerkId, false);
}
