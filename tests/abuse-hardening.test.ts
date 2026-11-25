// @vitest-environment edge-runtime
import { describe, expect, it, vi } from "vitest";
import { api } from "../convex/_generated/api";
import { RATE_LIMITS } from "../convex/lib/rateLimiter";
import {
  createBackend,
  requestLoan,
  setupNeighbors,
  TOOL,
  useFrozenClock,
  userIdOf,
} from "./support/backend";

useFrozenClock();

const BORROW_REQUESTS_PER_HOUR = RATE_LIMITS.borrowRequest.rate;

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71]);

describe("hardening against automated abuse", () => {
  it("accepts JPEG, PNG and WebP photos and rejects other file types", async () => {
    const { t, alice } = await setupNeighbors();

    const textId = await t.run((ctx) =>
      ctx.storage.store(new Blob(["not an image"], { type: "text/plain" })),
    );

    const pngId = await t.run((ctx) =>
      ctx.storage.store(new Blob([PNG_SIGNATURE], { type: "image/png" })),
    );

    await expect(
      alice.mutation(api.tools.create, { ...TOOL, photoIds: [textId] }),
    ).rejects.toThrow(/JPEG, PNG or WebP/);

    await alice.mutation(api.tools.create, { ...TOOL, photoIds: [pngId] });

    const [listing] = await alice.query(api.tools.listMyListings, {});

    expect(listing.photos).toHaveLength(1);
  });

  it("rate limits borrow requests per user", async () => {
    const { t, alice, bob } = await setupNeighbors();
    const ownerId = await userIdOf(t, "user_alice");

    await t.run(async (ctx) => {
      for (let index = 0; index <= BORROW_REQUESTS_PER_HOUR; index++) {
        await ctx.db.insert("tools", {
          ...TOOL,
          ownerId,
          name: `Tool ${index}`,
          createdAt: 0,
          updatedAt: 0,
        });
      }
    });

    const tools = await alice.query(api.tools.listMyListings, {});
    const allowed = tools.slice(0, BORROW_REQUESTS_PER_HOUR);
    const oneTooMany = tools[BORROW_REQUESTS_PER_HOUR];

    for (const tool of allowed) {
      await requestLoan(bob, tool._id, "2026-11-20", "2026-11-21");
    }

    await expect(
      requestLoan(bob, oneTooMany._id, "2026-11-20", "2026-11-21"),
    ).rejects.toThrow(/Too many requests/);
  });

  it("derives admin from verified ADMIN_EMAILS on every sync and revokes it when removed", async () => {
    vi.stubEnv("ADMIN_EMAILS", "dana@example.com");

    const t = createBackend();

    const unverified = t.withIdentity({
      subject: "user_eve",
      email: "dana@example.com",
      emailVerified: false,
    });

    const dana = t.withIdentity({
      subject: "user_dana",
      email: "dana@example.com",
      emailVerified: true,
    });

    await unverified.mutation(api.users.syncCurrentUser, {});

    expect((await unverified.query(api.users.getCurrentUser, {}))?.role).toBe(
      "user",
    );

    await dana.mutation(api.users.syncCurrentUser, {});

    expect((await dana.query(api.users.getCurrentUser, {}))?.role).toBe(
      "admin",
    );

    vi.stubEnv("ADMIN_EMAILS", "");

    await dana.mutation(api.users.syncCurrentUser, {});

    expect((await dana.query(api.users.getCurrentUser, {}))?.role).toBe("user");
  });
});
