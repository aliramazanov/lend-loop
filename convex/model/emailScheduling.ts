/*
 * scheduleLoanEmail: queues an email for one neighbor, which is sent only if the loan
 * change that triggered it is saved.
 */

import { internal } from "../_generated/api";
import { MutationCtx } from "../_generated/server";
import type { ScheduleLoanEmailArgs } from "../types";

export async function scheduleLoanEmail(
  ctx: MutationCtx,
  { emailId, kind, loan, recipientId }: ScheduleLoanEmailArgs,
) {
  const tool = await ctx.db.get("tools", loan.toolId);

  await ctx.scheduler.runAfter(0, internal.emails.sendLoanEmail, {
    emailId,
    kind,
    loanId: loan._id,
    recipientId,
    toolName: tool?.name ?? "your tool",
    startDate: loan.startDate,
    endDate: loan.endDate,
    attempt: 0,
  });
}
