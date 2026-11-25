/// <reference types="vite/client" />
import rateLimiterTest from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { afterEach, beforeEach, vi } from "vitest";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import schema from "../../convex/schema";

const modules = import.meta.glob("../../convex/**/*.ts");

export const FROZEN_NOW = new Date("2026-11-19T10:00:00Z");

export const TOOL = {
  name: "Cordless Drill",
  category: "power tools" as const,
  condition: "good" as const,
  shortDescription: "18V drill with two batteries",
};

export function createBackend() {
  const t = convexTest(schema, modules);

  rateLimiterTest.register(t);

  return t;
}

export type TestBackend = ReturnType<typeof createBackend>;

export type Neighbor = ReturnType<TestBackend["withIdentity"]>;

export function useFrozenClock() {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
}

export async function setupNeighbors() {
  const t = createBackend();
  const alice = t.withIdentity({ subject: "user_alice", name: "Alice" });
  const bob = t.withIdentity({ subject: "user_bob", name: "Bob" });
  const carol = t.withIdentity({ subject: "user_carol", name: "Carol" });

  for (const neighbor of [alice, bob, carol]) {
    await neighbor.mutation(api.users.syncCurrentUser, {});
  }

  return { t, alice, bob, carol };
}

export async function userIdOf(t: TestBackend, clerkId: string) {
  const user = await t.run(async (ctx) =>
    ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique(),
  );

  if (!user) throw new Error(`No user with clerkId ${clerkId}`);

  return user._id;
}

export async function promoteToAdmin(t: TestBackend, clerkId: string) {
  const userId = await userIdOf(t, clerkId);

  await t.run(async (ctx) => {
    await ctx.db.patch("users", userId, { role: "admin" });
  });
}

export async function loanOf(t: TestBackend, loanId: Id<"loans">) {
  return await t.run(async (ctx) => await ctx.db.get("loans", loanId));
}

export async function loanStatus(t: TestBackend, loanId: Id<"loans">) {
  return (await loanOf(t, loanId))?.status;
}

export async function requestLoan(
  borrower: Neighbor,
  toolId: Id<"tools">,
  startDate: string,
  endDate: string,
) {
  return await borrower.mutation(api.loans.requestBorrow, {
    toolId,
    startDate,
    endDate,
  });
}
