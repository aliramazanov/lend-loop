// @vitest-environment edge-runtime
import { describe, expect, it, vi } from "vitest";
import { api, internal } from "../convex/_generated/api";
import {
  loanOf,
  loanStatus,
  promoteToAdmin,
  requestLoan,
  setupNeighbors,
  TOOL,
  useFrozenClock,
  userIdOf,
} from "./support/backend";

useFrozenClock();

describe("business rules at the edges", () => {
  it("blocks a second overlapping request from the same borrower but allows other dates", async () => {
    const { alice, bob } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);

    await requestLoan(bob, toolId, "2026-11-20", "2026-11-22");

    await expect(
      requestLoan(bob, toolId, "2026-11-22", "2026-11-23"),
    ).rejects.toThrow(/already have a pending request/);

    await expect(
      requestLoan(bob, toolId, "2026-11-24", "2026-11-25"),
    ).resolves.toBeTruthy();
  });

  it("rejects borrowing your own tool or a removed one, and removal declines pending requests", async () => {
    const { t, alice, bob } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const pending = await requestLoan(bob, toolId, "2026-11-20", "2026-11-21");

    await expect(
      requestLoan(alice, toolId, "2026-11-20", "2026-11-21"),
    ).rejects.toThrow(/your own tool/);

    await alice.mutation(api.tools.remove, { toolId });

    expect(await loanStatus(t, pending)).toBe("declined");

    await expect(
      requestLoan(bob, toolId, "2026-11-25", "2026-11-26"),
    ).rejects.toThrow(/Tool not found/);
  });

  it("drops a pending extension when the loan is cancelled and refuses to approve it later", async () => {
    const { t, alice, bob } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const loanId = await requestLoan(bob, toolId, "2026-11-25", "2026-11-26");

    await alice.mutation(api.loans.approve, { loanId });

    await bob.mutation(api.loans.requestExtension, {
      loanId,
      endDate: "2026-11-28",
    });

    await bob.mutation(api.loans.cancel, { loanId });

    expect((await loanOf(t, loanId))?.extensionEndDate).toBeUndefined();

    await expect(
      alice.mutation(api.loans.respondToExtension, { loanId, approve: true }),
    ).rejects.toThrow(/no open extension request/);
  });

  it("lets the owner cancel a loan when the borrower never shows up", async () => {
    const { t, alice, bob } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const loanId = await requestLoan(bob, toolId, "2026-11-19", "2026-11-21");

    await alice.mutation(api.loans.approve, { loanId });
    vi.setSystemTime(new Date("2026-11-20T12:00:00Z"));
    await alice.mutation(api.loans.cancel, { loanId });

    expect(await loanStatus(t, loanId)).toBe("cancelled");
    expect(await t.query(api.tools.listPublicBoard, {})).toHaveLength(1);
  });

  it("never cancels a loan that was already handed over", async () => {
    const { alice, bob } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const loanId = await requestLoan(bob, toolId, "2026-11-19", "2026-11-21");

    await alice.mutation(api.loans.approve, { loanId });
    await alice.mutation(api.loans.confirmHandover, { loanId });

    await expect(bob.mutation(api.loans.cancel, { loanId })).rejects.toThrow(
      /weren't handed over/,
    );
  });

  it("keeps a suspended owner's listings hidden and their trust badge off", async () => {
    const { t, alice, carol } = await setupNeighbors();

    await promoteToAdmin(t, "user_carol");

    const aliceId = await userIdOf(t, "user_alice");
    const toolId = await alice.mutation(api.tools.create, TOOL);

    await carol.mutation(api.users.suspend, {
      userId: aliceId,
      reason: "Testing hidden listings",
    });

    await expect(carol.mutation(api.tools.restore, { toolId })).rejects.toThrow(
      /suspended or deleted/,
    );

    await expect(
      carol.mutation(api.users.setTrustedLender, {
        userId: aliceId,
        trustedLender: true,
      }),
    ).rejects.toThrow(/suspended neighbor/);
  });

  it("cancels a suspended borrower's loan that is waiting for pickup", async () => {
    const { t, alice, bob, carol } = await setupNeighbors();

    await promoteToAdmin(t, "user_carol");

    const toolId = await alice.mutation(api.tools.create, TOOL);
    const loanId = await requestLoan(bob, toolId, "2026-11-19", "2026-11-20");

    await alice.mutation(api.loans.approve, { loanId });

    await carol.mutation(api.users.suspend, {
      userId: await userIdOf(t, "user_bob"),
      reason: "Never picks tools up",
    });

    expect(await loanStatus(t, loanId)).toBe("cancelled");
  });

  it("expires stale requests and missed pickups but never a loan in progress", async () => {
    const { t, alice, bob } = await setupNeighbors();
    const drill = await alice.mutation(api.tools.create, TOOL);

    const tent = await alice.mutation(api.tools.create, {
      ...TOOL,
      name: "Tent",
    });

    const stale = await requestLoan(bob, drill, "2026-11-20", "2026-11-20");
    const inProgress = await requestLoan(bob, tent, "2026-11-19", "2026-11-20");

    await alice.mutation(api.loans.approve, { loanId: inProgress });
    await alice.mutation(api.loans.confirmHandover, { loanId: inProgress });

    vi.setSystemTime(new Date("2026-11-23T00:05:00Z"));
    await t.mutation(internal.loans.expireStaleLoans, {});

    expect(await loanStatus(t, stale)).toBe("expired");
    expect(await loanStatus(t, inProgress)).toBe("active");
  });
});
