// @vitest-environment edge-runtime
import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import {
  createBackend,
  promoteToAdmin,
  requestLoan,
  setupNeighbors,
  TOOL,
  useFrozenClock,
} from "./support/backend";

useFrozenClock();

describe("read queries", () => {
  it("shows the board with availability, owner details and the viewer's own tools", async () => {
    const { alice, bob } = await setupNeighbors();
    const drill = await alice.mutation(api.tools.create, TOOL);

    const tent = await alice.mutation(api.tools.create, {
      ...TOOL,
      name: "Tent",
      category: "camping",
    });

    const loanId = await requestLoan(bob, drill, "2026-11-19", "2026-11-20");

    await alice.mutation(api.loans.approve, { loanId });

    const board = await bob.query(api.tools.listBoard, {});

    const camping = await bob.query(api.tools.listBoard, {
      category: "camping",
    });

    const byId = new Map(board.map((tool) => [tool._id, tool]));

    expect(byId.get(drill)).toMatchObject({
      isAvailable: false,
      ownerName: "Alice",
      isOwner: false,
    });

    expect(byId.get(tent)).toMatchObject({ isAvailable: true });
    expect(camping.map((tool) => tool._id)).toEqual([tent]);

    const [ownView] = await alice.query(api.tools.listBoard, {
      category: "camping",
    });

    expect(ownView.isOwner).toBe(true);
  });

  it("hides a removed tool page from neighbors but not from its owner or an admin", async () => {
    const { t, alice, bob, carol } = await setupNeighbors();

    await promoteToAdmin(t, "user_carol");

    const toolId = await alice.mutation(api.tools.create, TOOL);

    await alice.mutation(api.tools.remove, { toolId });

    expect(await bob.query(api.tools.getDetails, { toolId })).toBeNull();

    expect(
      await bob.query(api.tools.getDetails, { toolId: "nope" }),
    ).toBeNull();

    await expect(
      alice.query(api.tools.getDetails, { toolId }),
    ).resolves.toMatchObject({ isArchived: true, isOwner: true });

    await expect(
      carol.query(api.tools.getDetails, { toolId }),
    ).resolves.toMatchObject({ isArchived: true, isOwner: false });

    expect(await alice.query(api.tools.listMyRemovedListings, {})).toHaveLength(
      1,
    );

    const [removed] = await carol.query(api.tools.listRemovedForAdmin, {});

    expect(removed).toMatchObject({ name: TOOL.name, ownerName: "Alice" });
  });

  it("lists booked ranges in date order and the owner's track record", async () => {
    const { alice, bob, carol } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const later = await requestLoan(carol, toolId, "2026-11-25", "2026-11-26");
    const sooner = await requestLoan(bob, toolId, "2026-11-21", "2026-11-22");

    await alice.mutation(api.loans.approve, { loanId: later });
    await alice.mutation(api.loans.approve, { loanId: sooner });

    const details = await bob.query(api.tools.getDetails, { toolId });

    expect(details?.bookedRanges).toEqual([
      { startDate: "2026-11-21", endDate: "2026-11-22" },
      { startDate: "2026-11-25", endDate: "2026-11-26" },
    ]);

    expect(details).toMatchObject({
      isAvailable: true,
      ownerName: "Alice",
      ownerActiveListings: 1,
      ownerCompletedLoans: 0,
    });
  });

  it("gives each side its own loan list and the owner a pending count", async () => {
    const { t, alice, bob, carol } = await setupNeighbors();

    await promoteToAdmin(t, "user_carol");

    const toolId = await alice.mutation(api.tools.create, TOOL);

    await requestLoan(bob, toolId, "2026-11-20", "2026-11-21");

    const [mine] = await bob.query(api.loans.listMyRequests, {});

    expect(mine).toMatchObject({
      toolName: TOOL.name,
      lenderName: "Alice",
      borrowerName: "Bob",
      status: "pending",
      hasStarted: false,
      isOverdue: false,
    });

    expect(await alice.query(api.loans.countPendingIncoming, {})).toBe(1);
    expect(await bob.query(api.loans.countPendingIncoming, {})).toBe(0);
    expect(await alice.query(api.loans.listMyRequests, {})).toHaveLength(0);
    expect(await carol.query(api.loans.listAllForAdmin, {})).toHaveLength(1);
  });

  it("returns no current user to a visitor who is not signed in", async () => {
    const t = createBackend();

    expect(await t.query(api.users.getCurrentUser, {})).toBeNull();
  });
});
