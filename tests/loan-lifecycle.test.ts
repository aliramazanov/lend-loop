// @vitest-environment edge-runtime
import { describe, expect, it, vi } from "vitest";
import { api } from "../convex/_generated/api";
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

describe("loan lifecycle", () => {
  it("runs a loan through handover, an extension and a damage report, and shows owners the history", async () => {
    const { t, alice, bob, carol } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const loanId = await requestLoan(bob, toolId, "2026-11-19", "2026-11-21");

    await alice.mutation(api.loans.approve, { loanId });

    await expect(
      carol.mutation(api.loans.confirmHandover, { loanId }),
    ).rejects.toThrow(/Forbidden/);

    await alice.mutation(api.loans.confirmHandover, { loanId });

    expect(await loanStatus(t, loanId)).toBe("active");

    await bob.mutation(api.loans.requestExtension, {
      loanId,
      endDate: "2026-11-23",
    });

    await expect(
      bob.mutation(api.loans.requestExtension, {
        loanId,
        endDate: "2026-11-24",
      }),
    ).rejects.toThrow(/already waiting/);

    await alice.mutation(api.loans.respondToExtension, {
      loanId,
      approve: true,
    });

    expect((await loanOf(t, loanId))?.endDate).toBe("2026-11-23");

    vi.setSystemTime(new Date("2026-11-25T10:00:00Z"));
    await bob.mutation(api.loans.claimReturn, { loanId });

    await expect(
      alice.mutation(api.loans.confirmReturn, { loanId, condition: "damaged" }),
    ).rejects.toThrow(/Describe what happened/);

    await alice.mutation(api.loans.confirmReturn, {
      loanId,
      condition: "damaged",
      note: "Blade guard cracked",
    });

    expect(await loanStatus(t, loanId)).toBe("returned");

    const [incoming] = await alice.query(api.loans.listIncomingRequests, {});

    expect(incoming.borrowerHistory).toMatchObject({
      completedLoans: 1,
      lateReturns: 1,
      reportedIssues: 1,
      overdueNow: 0,
    });
  });

  it("counts loans awaiting handover and reported issues in the admin overview", async () => {
    const { t, alice, bob, carol } = await setupNeighbors();

    await promoteToAdmin(t, "user_carol");

    const toolId = await alice.mutation(api.tools.create, TOOL);
    const loanId = await requestLoan(bob, toolId, "2026-11-19", "2026-11-20");
    const overview = () => carol.query(api.admin.overview, {});

    await alice.mutation(api.loans.approve, { loanId });

    expect(await overview()).toMatchObject({
      awaitingHandover: 1,
      activeLoans: 0,
    });

    await alice.mutation(api.loans.confirmHandover, { loanId });

    expect(await overview()).toMatchObject({
      awaitingHandover: 0,
      activeLoans: 1,
    });

    await alice.mutation(api.loans.confirmReturn, {
      loanId,
      condition: "missing",
      note: "Never came back",
    });

    expect(await overview()).toMatchObject({
      activeLoans: 0,
      reportedIssues: 1,
    });
  });

  it("cancels a suspended borrower's upcoming loans but keeps loans in progress open", async () => {
    const { t, alice, bob, carol } = await setupNeighbors();

    await promoteToAdmin(t, "user_carol");

    const drill = await alice.mutation(api.tools.create, TOOL);

    const tent = await alice.mutation(api.tools.create, {
      ...TOOL,
      name: "Tent",
      category: "camping",
    });

    const inProgress = await requestLoan(
      bob,
      drill,
      "2026-11-19",
      "2026-11-20",
    );

    const upcoming = await requestLoan(bob, tent, "2026-11-25", "2026-11-26");

    await alice.mutation(api.loans.approve, { loanId: inProgress });
    await alice.mutation(api.loans.approve, { loanId: upcoming });
    await alice.mutation(api.loans.confirmHandover, { loanId: inProgress });

    await carol.mutation(api.users.suspend, {
      userId: await userIdOf(t, "user_bob"),
      reason: "Repeated no-shows",
    });

    expect(await loanStatus(t, inProgress)).toBe("active");
    expect(await loanStatus(t, upcoming)).toBe("cancelled");
  });

  it("lets only an admin suspend a user, which hides their listings, closes requests and blocks them", async () => {
    const { t, alice, bob, carol } = await setupNeighbors();

    await promoteToAdmin(t, "user_carol");

    const aliceId = await userIdOf(t, "user_alice");
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const loanId = await requestLoan(bob, toolId, "2026-11-20", "2026-11-21");
    const suspension = { userId: aliceId, reason: "Spam listings" };

    await expect(
      bob.mutation(api.users.setTrustedLender, {
        userId: aliceId,
        trustedLender: true,
      }),
    ).rejects.toThrow(/Admin role required/);

    await expect(bob.mutation(api.users.suspend, suspension)).rejects.toThrow(
      /Admin role required/,
    );

    await carol.mutation(api.users.suspend, suspension);

    expect(await loanStatus(t, loanId)).toBe("declined");
    expect(await t.query(api.tools.listPublicBoard, {})).toHaveLength(0);

    await expect(alice.mutation(api.tools.create, TOOL)).rejects.toThrow(
      /suspended/,
    );

    await carol.mutation(api.users.reinstate, { userId: aliceId });

    await expect(alice.mutation(api.tools.create, TOOL)).resolves.toBeTruthy();
  });
});
