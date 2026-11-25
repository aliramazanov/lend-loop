// @vitest-environment edge-runtime
import { describe, expect, it, vi } from "vitest";
import { api, internal } from "../convex/_generated/api";
import {
  loanStatus,
  requestLoan,
  setupNeighbors,
  TOOL,
  useFrozenClock,
} from "./support/backend";

useFrozenClock();

describe("public board and borrowing rules", () => {
  it("exposes only name and category, and hides tools that are on loan today", async () => {
    const { t, alice, bob } = await setupNeighbors();
    const drill = await alice.mutation(api.tools.create, TOOL);

    await alice.mutation(api.tools.create, {
      ...TOOL,
      name: "Tent",
      category: "camping",
    });

    const loanId = await requestLoan(bob, drill, "2026-11-19", "2026-11-21");

    await alice.mutation(api.loans.approve, { loanId });

    const board = await t.query(api.tools.listPublicBoard, {});

    expect(board).toHaveLength(1);
    expect(Object.keys(board[0]).sort()).toEqual(["_id", "category", "name"]);
    expect(board[0].name).toBe("Tent");
  });

  it("rejects past start dates and requests that overlap an approved loan", async () => {
    const { alice, bob, carol } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);

    await expect(
      requestLoan(bob, toolId, "2026-11-18", "2026-11-20"),
    ).rejects.toThrow(/past/);

    const loanId = await requestLoan(bob, toolId, "2026-11-20", "2026-11-22");

    await alice.mutation(api.loans.approve, { loanId });

    await expect(
      requestLoan(carol, toolId, "2026-11-22", "2026-11-24"),
    ).rejects.toThrow(/overlaps/);
  });

  it("rejects an extension that would run into the next booking", async () => {
    const { alice, bob, carol } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const first = await requestLoan(bob, toolId, "2026-11-19", "2026-11-20");
    const second = await requestLoan(carol, toolId, "2026-11-22", "2026-11-23");

    await alice.mutation(api.loans.approve, { loanId: first });
    await alice.mutation(api.loans.approve, { loanId: second });

    await expect(
      bob.mutation(api.loans.requestExtension, {
        loanId: first,
        endDate: "2026-11-22",
      }),
    ).rejects.toThrow(/overlaps/);

    await bob.mutation(api.loans.requestExtension, {
      loanId: first,
      endDate: "2026-11-21",
    });
  });

  it("allows the handover only from the start day and only by the owner", async () => {
    const { t, alice, bob } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const loanId = await requestLoan(bob, toolId, "2026-11-21", "2026-11-22");

    await alice.mutation(api.loans.approve, { loanId });

    await expect(
      alice.mutation(api.loans.confirmHandover, { loanId }),
    ).rejects.toThrow(/hasn't started/);

    vi.setSystemTime(new Date("2026-11-21T09:00:00Z"));

    await expect(
      bob.mutation(api.loans.claimReturn, { loanId }),
    ).rejects.toThrow(/Only active loans/);

    await alice.mutation(api.loans.confirmHandover, { loanId });

    expect(await loanStatus(t, loanId)).toBe("active");
  });

  it("expires approved loans that were never picked up", async () => {
    const { t, alice, bob } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const loanId = await requestLoan(bob, toolId, "2026-11-19", "2026-11-20");

    await alice.mutation(api.loans.approve, { loanId });

    vi.setSystemTime(new Date("2026-11-22T00:05:00Z"));

    await t.mutation(internal.loans.expireStaleLoans, {});

    expect(await loanStatus(t, loanId)).toBe("expired");
  });

  it("rejects approving a request whose start date has passed and expires it", async () => {
    const { t, alice, bob } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const loanId = await requestLoan(bob, toolId, "2026-11-20", "2026-11-21");

    vi.setSystemTime(new Date("2026-11-25T10:00:00Z"));

    await expect(alice.mutation(api.loans.approve, { loanId })).rejects.toThrow(
      /expired/,
    );

    await t.mutation(internal.loans.expireStaleLoans, {});

    expect(await loanStatus(t, loanId)).toBe("expired");
  });
});
