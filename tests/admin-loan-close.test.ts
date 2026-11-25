// @vitest-environment edge-runtime
import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import {
  loanOf,
  loanStatus,
  promoteToAdmin,
  requestLoan,
  setupNeighbors,
  TOOL,
  userIdOf,
  useFrozenClock,
} from "./support/backend";

useFrozenClock();

async function activeLoanWithAdmin() {
  const neighbors = await setupNeighbors();
  const { t, alice, bob } = neighbors;

  await promoteToAdmin(t, "user_carol");

  const toolId = await alice.mutation(api.tools.create, TOOL);
  const loanId = await requestLoan(bob, toolId, "2026-11-19", "2026-11-21");

  await alice.mutation(api.loans.approve, { loanId });
  await alice.mutation(api.loans.confirmHandover, { loanId });

  return { ...neighbors, loanId };
}

describe("returns when the owner can no longer act", () => {
  it("lets an admin confirm the return after the owner is suspended", async () => {
    const { t, alice, carol, loanId } = await activeLoanWithAdmin();

    await carol.mutation(api.users.suspend, {
      userId: await userIdOf(t, "user_alice"),
      reason: "Unsafe tools reported",
    });

    await expect(
      alice.mutation(api.loans.confirmReturn, {
        loanId,
        condition: "as_expected",
      }),
    ).rejects.toThrow(/suspended/);

    const [listed] = await carol.query(api.loans.listAllForAdmin, {});

    expect(listed.lenderUnavailable).toBe(true);

    await carol.mutation(api.loans.confirmReturnAsAdmin, {
      loanId,
      condition: "damaged",
      note: "Handle was cracked on return",
    });

    expect(await loanOf(t, loanId)).toMatchObject({
      status: "returned",
      returnCondition: "damaged",
    });

    const audit = await carol.query(api.users.listAuditLogForAdmin, {});

    const closed = audit.find(
      (entry) => entry.action === "loan_closed_by_admin",
    );

    expect(closed).toMatchObject({
      actorName: "Carol",
      targetName: "Cordless Drill",
      detail: expect.stringContaining("Damaged"),
    });
  });

  it("leaves the return to an owner whose account is still active", async () => {
    const { t, carol, loanId } = await activeLoanWithAdmin();

    await expect(
      carol.mutation(api.loans.confirmReturnAsAdmin, {
        loanId,
        condition: "as_expected",
      }),
    ).rejects.toThrow(/Only the owner can confirm/);

    expect(await loanStatus(t, loanId)).toBe("active");
  });

  it("keeps regular neighbors away from the admin return", async () => {
    const { bob, loanId } = await activeLoanWithAdmin();

    await expect(
      bob.mutation(api.loans.confirmReturnAsAdmin, {
        loanId,
        condition: "as_expected",
      }),
    ).rejects.toThrow(/Admin role required/);
  });
});
