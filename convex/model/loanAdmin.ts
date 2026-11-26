/*
 * Admin help when an owner cannot act.
 *
 * isUnavailable: whether an account is missing, suspended or deleted.
 * confirmReturnForOwner: lets an admin close a loan whose owner is unavailable. It is
 * refused while the owner can still act, and every use is written to the audit log.
 */

import { Doc } from "../_generated/dataModel";
import { forbidden } from "../lib/errors";
import { enforceRateLimit } from "../lib/rateLimiter";
import { RETURN_CONDITION_LABELS } from "../shared/catalog";
import { recordAudit } from "./audit";
import { assertLoanStatus, getLoanOrThrow } from "./loanAccess";
import { recordReturn } from "./loanReturns";
import type { ReturnReport, UserMutationCtx } from "../types";

export function isUnavailable(user: Doc<"users"> | null): boolean {
  return !user || Boolean(user.suspendedAt || user.deletedAt);
}

export async function confirmReturnForOwner(
  ctx: UserMutationCtx,
  report: ReturnReport,
) {
  const { user: admin } = ctx;
  const loan = await getLoanOrThrow(ctx, report.loanId);

  assertLoanStatus(loan, "active");

  const owner = await ctx.db.get("users", loan.lenderId);

  if (!isUnavailable(owner)) {
    throw forbidden(
      "Only the owner can confirm this return while their account is active.",
    );
  }

  await enforceRateLimit(ctx, "adminAction", admin._id);
  await recordReturn(ctx, loan, report);

  const tool = await ctx.db.get("tools", loan.toolId);

  await recordAudit(ctx, {
    actorId: admin._id,
    action: "loan_closed_by_admin",
    targetType: "loan",
    targetId: loan._id,
    summary: `${admin.name} confirmed the return of "${tool?.name ?? "a tool"}" for ${owner?.name ?? "a removed account"} (${report.condition})`,
    detail: `For ${owner?.name ?? "a removed account"}: ${RETURN_CONDITION_LABELS[report.condition]}`,
  });
}
