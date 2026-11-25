// @vitest-environment edge-runtime
import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import {
  loanStatus,
  promoteToAdmin,
  requestLoan,
  setupNeighbors,
  TOOL,
  useFrozenClock,
} from "./support/backend";

useFrozenClock();

describe("role-based access enforced in Convex functions", () => {
  it("prevents a user from editing or deleting another user's listing", async () => {
    const { alice, bob } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);

    await expect(
      bob.mutation(api.tools.update, { toolId, ...TOOL, name: "Mine now" }),
    ).rejects.toThrow(/Forbidden/);

    await expect(bob.mutation(api.tools.remove, { toolId })).rejects.toThrow(
      /Forbidden/,
    );
  });

  it("returns a listing for editing only to its owner", async () => {
    const { alice, bob } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);

    const own = await alice.query(api.tools.getMyListing, { toolId });
    const someoneElses = await bob.query(api.tools.getMyListing, { toolId });

    expect(own?.name).toBe(TOOL.name);
    expect(someoneElses).toBeNull();
  });

  it("lets only the tool owner approve, and declines overlapping pending requests", async () => {
    const { t, alice, bob, carol } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const bobLoan = await requestLoan(bob, toolId, "2026-11-20", "2026-11-22");

    const carolLoan = await requestLoan(
      carol,
      toolId,
      "2026-11-21",
      "2026-11-23",
    );

    await expect(
      bob.mutation(api.loans.approve, { loanId: bobLoan }),
    ).rejects.toThrow(/Forbidden/);

    const result = await alice.mutation(api.loans.approve, { loanId: bobLoan });

    expect(result.autoDeclined).toBe(1);
    expect(await loanStatus(t, bobLoan)).toBe("approved");
    expect(await loanStatus(t, carolLoan)).toBe("declined");
  });

  it("lets an admin remove and restore any listing, audits both, and hides the log from users", async () => {
    const { t, alice, bob, carol } = await setupNeighbors();

    await promoteToAdmin(t, "user_carol");

    const toolId = await alice.mutation(api.tools.create, TOOL);

    await carol.mutation(api.tools.remove, { toolId });

    expect(await t.query(api.tools.listPublicBoard, {})).toHaveLength(0);

    await expect(bob.mutation(api.tools.restore, { toolId })).rejects.toThrow(
      /Forbidden/,
    );

    await carol.mutation(api.tools.restore, { toolId });

    expect(await t.query(api.tools.listPublicBoard, {})).toHaveLength(1);

    const audit = await carol.query(api.users.listAuditLogForAdmin, {});

    expect(audit.map((entry) => entry.action)).toEqual([
      "listing_restored",
      "listing_removed_by_admin",
    ]);

    await expect(bob.query(api.users.listAuditLogForAdmin, {})).rejects.toThrow(
      /Admin role required/,
    );
  });

  it("lets only the lender decline or mark returned, and only the borrower cancel", async () => {
    const { t, alice, bob, carol } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const loanId = await requestLoan(bob, toolId, "2026-11-20", "2026-11-21");
    const asExpected = { loanId, condition: "as_expected" as const };

    await expect(carol.mutation(api.loans.decline, { loanId })).rejects.toThrow(
      /Forbidden/,
    );

    await expect(alice.mutation(api.loans.cancel, { loanId })).rejects.toThrow(
      /Forbidden/,
    );

    await alice.mutation(api.loans.approve, { loanId });

    await expect(
      bob.mutation(api.loans.confirmReturn, asExpected),
    ).rejects.toThrow(/Forbidden/);

    await expect(
      alice.mutation(api.loans.confirmReturn, asExpected),
    ).rejects.toThrow(/Only active loans/);

    await alice.mutation(api.loans.cancel, { loanId });

    expect(await loanStatus(t, loanId)).toBe("cancelled");
  });

  it("keeps admin-only queries away from regular users", async () => {
    const { bob } = await setupNeighbors();

    const adminQueries = [
      () => bob.query(api.loans.listAllForAdmin, {}),
      () => bob.query(api.users.listUsersForAdmin, {}),
      () => bob.query(api.n8n.listWorkflowFailuresForAdmin, {}),
      () => bob.query(api.admin.overview, {}),
    ];

    for (const runAdminQuery of adminQueries) {
      await expect(runAdminQuery()).rejects.toThrow(/Admin role required/);
    }
  });

  it("rejects anonymous calls to signed-in functions", async () => {
    const { t, alice } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);

    await expect(t.query(api.tools.listBoard, {})).rejects.toThrow(
      /Unauthorized/,
    );

    await expect(t.mutation(api.tools.create, TOOL)).rejects.toThrow(
      /Unauthorized/,
    );

    await expect(
      t.mutation(api.loans.requestBorrow, {
        toolId,
        startDate: "2026-11-20",
        endDate: "2026-11-21",
      }),
    ).rejects.toThrow(/Unauthorized/);
  });
});
