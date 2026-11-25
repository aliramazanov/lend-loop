// @vitest-environment edge-runtime
import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import {
  loanOf,
  requestLoan,
  setupNeighbors,
  TOOL,
  useFrozenClock,
} from "./support/backend";

useFrozenClock();

async function approvedLoan() {
  const neighbors = await setupNeighbors();
  const { alice, bob } = neighbors;
  const toolId = await alice.mutation(api.tools.create, TOOL);
  const loanId = await requestLoan(bob, toolId, "2026-11-19", "2026-11-20");

  await alice.mutation(api.loans.approve, { loanId });

  return { ...neighbors, loanId };
}

describe("two-sided handover", () => {
  it("lets the borrower confirm pickup and the owner acknowledge it", async () => {
    const { t, alice, bob, loanId } = await approvedLoan();

    await bob.mutation(api.loans.confirmHandover, { loanId });

    expect(await loanOf(t, loanId)).toMatchObject({
      status: "active",
      handoverConfirmedBy: "borrower",
    });

    await expect(
      bob.mutation(api.loans.acknowledgeHandover, { loanId }),
    ).rejects.toThrow(/other neighbor confirms/);

    await alice.mutation(api.loans.acknowledgeHandover, { loanId });

    await expect(
      bob.mutation(api.loans.disputeHandover, { loanId }),
    ).rejects.toThrow(/other neighbor confirms/);

    await expect(
      alice.mutation(api.loans.disputeHandover, { loanId }),
    ).rejects.toThrow(/both confirmed/);
  });

  it("puts a disputed handover back to waiting for pickup and logs it", async () => {
    const { t, alice, bob, carol, loanId } = await approvedLoan();

    await alice.mutation(api.loans.confirmHandover, { loanId });

    await expect(
      carol.mutation(api.loans.disputeHandover, { loanId }),
    ).rejects.toThrow(/Forbidden/);

    await bob.mutation(api.loans.disputeHandover, { loanId });

    const loan = await loanOf(t, loanId);

    expect(loan).toMatchObject({ status: "approved" });
    expect(loan?.handedOverAt).toBeUndefined();
    expect(loan?.handoverConfirmedBy).toBeUndefined();

    const audit = await t.run((ctx) => ctx.db.query("auditEvents").collect());

    expect(audit.map((event) => event.action)).toContain("handover_disputed");

    await alice.mutation(api.loans.confirmHandover, { loanId });

    expect((await loanOf(t, loanId))?.status).toBe("active");
  });

  it("can't be disputed once the return is under way", async () => {
    const { alice, bob, loanId } = await approvedLoan();

    await alice.mutation(api.loans.confirmHandover, { loanId });
    await bob.mutation(api.loans.claimReturn, { loanId });

    await expect(
      bob.mutation(api.loans.disputeHandover, { loanId }),
    ).rejects.toThrow(/under way/);
  });
});
