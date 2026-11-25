// @vitest-environment edge-runtime
import { describe, expect, it, vi } from "vitest";
import { api, internal } from "../convex/_generated/api";
import {
  requestLoan,
  setupNeighbors,
  TOOL,
  useFrozenClock,
} from "./support/backend";

useFrozenClock();

async function activeLoan() {
  const neighbors = await setupNeighbors();
  const { alice, bob } = neighbors;
  const toolId = await alice.mutation(api.tools.create, TOOL);
  const loanId = await requestLoan(bob, toolId, "2026-11-19", "2026-11-20");

  await alice.mutation(api.loans.approve, { loanId });
  await alice.mutation(api.loans.confirmHandover, { loanId });

  return { ...neighbors, loanId };
}

describe("a borrower who already handed the tool back", () => {
  it("gets no due-soon or overdue reminders while the owner has not confirmed", async () => {
    const { t, bob, loanId } = await activeLoan();

    await bob.mutation(api.loans.claimReturn, { loanId });

    const dueSoon = await t.query(internal.n8n.listDueSoonLoans, {
      tomorrow: "2026-11-20",
    });

    const overdue = await t.query(internal.n8n.listOverdueLoans, {
      today: "2026-11-22",
    });

    const reminder = await t.mutation(internal.n8n.recordOverdueReminder, {
      loanId,
      today: "2026-11-22",
    });

    expect(dueSoon).toEqual([]);
    expect(overdue).toEqual([]);
    expect(reminder).toBeNull();
  });

  it("is not marked late when the owner confirms the return days later", async () => {
    const { alice, bob, loanId } = await activeLoan();

    await bob.mutation(api.loans.claimReturn, { loanId });

    vi.setSystemTime(new Date("2026-11-25T10:00:00Z"));

    const [beforeConfirming] = await alice.query(
      api.loans.listIncomingRequests,
      {},
    );

    expect(beforeConfirming.isOverdue).toBe(false);

    await alice.mutation(api.loans.confirmReturn, {
      loanId,
      condition: "as_expected",
    });

    const [incoming] = await alice.query(api.loans.listIncomingRequests, {});

    expect(incoming.borrowerHistory).toMatchObject({
      completedLoans: 1,
      lateReturns: 0,
      overdueNow: 0,
    });
  });
});
