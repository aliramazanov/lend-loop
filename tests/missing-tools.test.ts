// @vitest-environment edge-runtime
import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import {
  loanStatus,
  requestLoan,
  setupNeighbors,
  TOOL,
  useFrozenClock,
} from "./support/backend";

useFrozenClock();

describe("a tool reported as not returned", () => {
  it("comes off the board and releases every other booking", async () => {
    const { t, alice, bob, carol } = await setupNeighbors();
    const dave = t.withIdentity({ subject: "user_dave", name: "Dave" });

    await dave.mutation(api.users.syncCurrentUser, {});

    const toolId = await alice.mutation(api.tools.create, TOOL);
    const loanId = await requestLoan(bob, toolId, "2026-11-19", "2026-11-20");
    const booked = await requestLoan(carol, toolId, "2026-11-22", "2026-11-23");
    const waiting = await requestLoan(dave, toolId, "2026-11-25", "2026-11-26");

    await alice.mutation(api.loans.approve, { loanId });
    await alice.mutation(api.loans.approve, { loanId: booked });
    await alice.mutation(api.loans.confirmHandover, { loanId });

    await alice.mutation(api.loans.confirmReturn, {
      loanId,
      condition: "missing",
      note: "Never came back after several messages",
    });

    expect(await loanStatus(t, booked)).toBe("cancelled");
    expect(await loanStatus(t, waiting)).toBe("declined");

    const board = await carol.query(api.tools.listBoard, {});

    expect(board.map((tool) => tool._id)).not.toContain(toolId);

    const removed = await alice.query(api.tools.listMyRemovedListings, {});

    expect(removed.map((tool) => tool._id)).toContain(toolId);
  });

  it("stays listed after a damage report", async () => {
    const { alice, bob, carol } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const loanId = await requestLoan(bob, toolId, "2026-11-19", "2026-11-20");

    await alice.mutation(api.loans.approve, { loanId });
    await alice.mutation(api.loans.confirmHandover, { loanId });

    await alice.mutation(api.loans.confirmReturn, {
      loanId,
      condition: "damaged",
      note: "The chuck is cracked now",
    });

    const board = await carol.query(api.tools.listBoard, {});

    expect(board.map((tool) => tool._id)).toContain(toolId);
  });
});
