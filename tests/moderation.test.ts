// @vitest-environment edge-runtime
import { describe, expect, it, vi } from "vitest";
import { api } from "../convex/_generated/api";
import { CLERK_API_URL } from "../convex/lib/config";
import {
  promoteToAdmin,
  setupNeighbors,
  useFrozenClock,
  userIdOf,
} from "./support/backend";
import { stubFetch } from "./support/fetchStub";

useFrozenClock();

const REASON = "Repeated no-shows";

function clerkUrls(requests: Request[]): string[] {
  return requests
    .map((request) => request.url)
    .filter((url) => url.startsWith(CLERK_API_URL));
}

async function setupModeration() {
  const neighbors = await setupNeighbors();

  await promoteToAdmin(neighbors.t, "user_carol");

  return {
    ...neighbors,
    bobId: await userIdOf(neighbors.t, "user_bob"),
    carolId: await userIdOf(neighbors.t, "user_carol"),
  };
}

describe("moderation guards", () => {
  it("refuses to suspend yourself, another admin, or someone already suspended", async () => {
    const { t, carol, bobId, carolId } = await setupModeration();

    await expect(
      carol.mutation(api.users.suspend, { userId: carolId, reason: REASON }),
    ).rejects.toThrow(/suspend yourself/);

    await promoteToAdmin(t, "user_alice");

    await expect(
      carol.mutation(api.users.suspend, {
        userId: await userIdOf(t, "user_alice"),
        reason: REASON,
      }),
    ).rejects.toThrow(/Admins can't be suspended/);

    await carol.mutation(api.users.suspend, { userId: bobId, reason: REASON });

    await expect(
      carol.mutation(api.users.suspend, { userId: bobId, reason: REASON }),
    ).rejects.toThrow(/already suspended/);
  });

  it("requires a real reason and refuses to reinstate someone who is not suspended", async () => {
    const { carol, bobId } = await setupModeration();

    await expect(
      carol.mutation(api.users.suspend, { userId: bobId, reason: "  no  " }),
    ).rejects.toThrow(/between 5 and 200/);

    await expect(
      carol.mutation(api.users.reinstate, { userId: bobId }),
    ).rejects.toThrow(/isn't suspended/);
  });

  it("bans the account in Clerk on suspension and lifts the ban on reinstatement", async () => {
    vi.stubEnv("CLERK_SECRET_KEY", "sk_test_e2e_placeholder");

    const requests = stubFetch();

    const { t, carol, bobId } = await setupModeration();

    await carol.mutation(api.users.suspend, { userId: bobId, reason: REASON });
    await t.finishAllScheduledFunctions(vi.runAllTimers);
    await carol.mutation(api.users.reinstate, { userId: bobId });
    await t.finishAllScheduledFunctions(vi.runAllTimers);

    const clerkCalls = clerkUrls(requests);

    expect(clerkCalls).toEqual([
      `${CLERK_API_URL}/users/user_bob/ban`,
      `${CLERK_API_URL}/users/user_bob/unban`,
    ]);
  });

  it("skips the Clerk ban when the secret key is missing", async () => {
    const requests = stubFetch();

    const { t, carol, bobId } = await setupModeration();

    await carol.mutation(api.users.suspend, { userId: bobId, reason: REASON });
    await t.finishAllScheduledFunctions(vi.runAllTimers);

    expect(clerkUrls(requests)).toEqual([]);
  });
});
