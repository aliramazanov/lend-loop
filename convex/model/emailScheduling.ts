import { internal } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { EmailKind } from "../lib/events";

export async function scheduleLoanEmail(
  ctx: MutationCtx,
  {
    emailId,
    kind,
    loan,
    recipientId,
  }: {
    emailId: string;
    kind: EmailKind;
    loan: Doc<"loans">;
    recipientId: Id<"users">;
  },
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
