// @vitest-environment edge-runtime
import { describe, expect, it, vi } from "vitest";
import { api } from "../convex/_generated/api";
import { OPEN_ENDED_DATE } from "../convex/lib/dates";
import {
  requestLoan,
  setupNeighbors,
  TOOL,
  useFrozenClock,
} from "./support/backend";

useFrozenClock();

async function overdueTool() {
  const neighbors = await setupNeighbors();
  const { alice, bob } = neighbors;
  const toolId = await alice.mutation(api.tools.create, TOOL);
  const loanId = await requestLoan(bob, toolId, "2026-11-19", "2026-11-20");

  await alice.mutation(api.loans.approve, { loanId });
  await alice.mutation(api.loans.confirmHandover, { loanId });

  vi.setSystemTime(new Date("2026-11-23T10:00:00Z"));

  return { ...neighbors, toolId, loanId };
}

describe("a tool still out past its return date", () => {
  it("can't be booked by anyone until the owner confirms the return", async () => {
    const { alice, carol, toolId, loanId } = await overdueTool();

    await expect(
      requestLoan(carol, toolId, "2026-11-27", "2026-11-28"),
    ).rejects.toThrow(/still out past its return date/);

    await alice.mutation(api.loans.confirmReturn, {
      loanId,
      condition: "as_expected",
    });

    await expect(
      requestLoan(carol, toolId, "2026-11-27", "2026-11-28"),
    ).resolves.toBeTruthy();
  });

  it("shows as booked from the loan start onwards on the tool page", async () => {
    const { carol, toolId } = await overdueTool();

    const details = await carol.query(api.tools.getDetails, { toolId });

    expect(details).toMatchObject({
      isAvailable: false,
      bookedRanges: [{ startDate: "2026-11-19", endDate: OPEN_ENDED_DATE }],
    });
  });
});
