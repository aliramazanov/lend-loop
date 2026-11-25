import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { recordAudit } from "./audit";
import { isBeforeHandover } from "./loanRules";
import { loansAsBorrower, loansAsLender } from "./loanStore";
import { transitionLoan } from "./loanTransitions";
import { isListed, listOwnedTools } from "./toolStore";

async function closeLoan(
  ctx: MutationCtx,
  loan: Doc<"loans">,
  userId: Id<"users">,
) {
  const isLender = loan.lenderId === userId;
  const declinesRequest = isLender && loan.status === "pending";

  await transitionLoan(ctx, loan, {
    status: declinesRequest ? "declined" : "cancelled",
    event: declinesRequest ? "loan_declined" : "loan_cancelled",
    recipientId: isLender ? loan.borrowerId : loan.lenderId,
  });
}

export async function closeOpenLoans(ctx: MutationCtx, userId: Id<"users">) {
  const asBorrower = await loansAsBorrower(ctx, userId);
  const asLender = await loansAsLender(ctx, userId);

  const notHandedOver = [...asBorrower, ...asLender].filter(isBeforeHandover);

  for (const loan of notHandedOver) {
    await closeLoan(ctx, loan, userId);
  }

  return notHandedOver.length;
}

export async function hideListings(ctx: MutationCtx, ownerId: Id<"users">) {
  const now = Date.now();
  const owned = await listOwnedTools(ctx, ownerId);
  const listed = owned.filter(isListed);

  for (const tool of listed) {
    await ctx.db.patch("tools", tool._id, { archivedAt: now, updatedAt: now });
  }

  return listed.length;
}

export async function anonymizeDeletedAccount(
  ctx: MutationCtx,
  clerkId: string,
) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();

  if (!user || user.deletedAt) return { changed: false };

  await ctx.db.patch("users", user._id, {
    name: "Deleted user",
    role: "user",
    trustedLender: false,
    deletedAt: Date.now(),
  });

  const closedLoans = await closeOpenLoans(ctx, user._id);
  const hiddenListings = await hideListings(ctx, user._id);

  await recordAudit(ctx, {
    actorId: user._id,
    action: "account_deleted",
    targetType: "user",
    targetId: user._id,
    summary: `A Clerk account was deleted (${hiddenListings} listings hidden, ${closedLoans} loans closed)`,
    detail: `${hiddenListings} listings hidden, ${closedLoans} loans closed`,
  });

  return { changed: true };
}
