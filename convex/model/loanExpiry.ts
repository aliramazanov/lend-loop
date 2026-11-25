import { MutationCtx } from "../_generated/server";
import { todayUtc } from "../lib/dates";
import { isMissedPickup, isStaleRequest } from "./loanRules";
import { loansWithStatus } from "./loanStore";
import { transitionLoan } from "./loanTransitions";

export async function expireStaleLoans(ctx: MutationCtx) {
  const today = todayUtc();
  const pending = await loansWithStatus(ctx, "pending");
  const approved = await loansWithStatus(ctx, "approved");

  const stale = [
    ...pending.filter((loan) => isStaleRequest(loan, today)),
    ...approved.filter((loan) => isMissedPickup(loan, today)),
  ];

  for (const loan of stale) {
    await transitionLoan(ctx, loan, {
      status: "expired",
      event: "loan_expired",
      recipientId: loan.borrowerId,
    });
  }

  return { expired: stale.length };
}
