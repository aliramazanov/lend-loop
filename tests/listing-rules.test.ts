// @vitest-environment edge-runtime
import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import { LISTING_POLICY } from "../convex/shared/policy";
import {
  requestLoan,
  setupNeighbors,
  TOOL,
  useFrozenClock,
  type TestBackend,
} from "./support/backend";

useFrozenClock();

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71]);

async function storePhoto(t: TestBackend) {
  return await t.run((ctx) =>
    ctx.storage.store(new Blob([PNG_SIGNATURE], { type: "image/png" })),
  );
}

describe("listing rules", () => {
  it("caps active listings per owner, including on restore", async () => {
    const { alice } = await setupNeighbors();
    const toolIds = [];

    for (let index = 0; index < LISTING_POLICY.maxActivePerOwner; index++) {
      toolIds.push(
        await alice.mutation(api.tools.create, {
          ...TOOL,
          name: `Tool ${index}`,
        }),
      );
    }

    await expect(alice.mutation(api.tools.create, TOOL)).rejects.toThrow(
      `at most ${LISTING_POLICY.maxActivePerOwner} active listings`,
    );

    const [first] = toolIds;

    await alice.mutation(api.tools.remove, { toolId: first });
    await alice.mutation(api.tools.create, TOOL);

    await expect(
      alice.mutation(api.tools.restore, { toolId: first }),
    ).rejects.toThrow(/active listings/);
  });

  it("deletes photos that an edit drops and keeps the ones it keeps", async () => {
    const { t, alice } = await setupNeighbors();
    const kept = await storePhoto(t);
    const dropped = await storePhoto(t);

    const toolId = await alice.mutation(api.tools.create, {
      ...TOOL,
      photoIds: [kept, dropped],
    });

    await alice.mutation(api.tools.update, {
      toolId,
      ...TOOL,
      photoIds: [kept],
    });

    const stored = await t.run(async (ctx) => ({
      kept: await ctx.storage.getUrl(kept),
      dropped: await ctx.storage.getUrl(dropped),
    }));

    expect(stored.kept).not.toBeNull();
    expect(stored.dropped).toBeNull();
  });

  it("refuses extensions on finished loans and end dates that are not later", async () => {
    const { alice, bob } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const loanId = await requestLoan(bob, toolId, "2026-11-19", "2026-11-21");

    await alice.mutation(api.loans.approve, { loanId });

    await expect(
      bob.mutation(api.loans.requestExtension, {
        loanId,
        endDate: "2026-11-21",
      }),
    ).rejects.toThrow(/after the current one/);

    await alice.mutation(api.loans.confirmHandover, { loanId });

    await alice.mutation(api.loans.confirmReturn, {
      loanId,
      condition: "as_expected",
    });

    await expect(
      bob.mutation(api.loans.requestExtension, {
        loanId,
        endDate: "2026-11-23",
      }),
    ).rejects.toThrow(/upcoming or active/);
  });
});
