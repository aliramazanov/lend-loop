// @vitest-environment edge-runtime
import { Webhook } from "svix";
import { describe, expect, it, vi } from "vitest";
import { api } from "../convex/_generated/api";
import { unixSeconds } from "../convex/lib/dates";
import { HTTP_ROUTES } from "../convex/lib/httpRoutes";
import {
  setupNeighbors,
  TOOL,
  useFrozenClock,
  userIdOf,
  type TestBackend,
} from "./support/backend";

useFrozenClock();

const WEBHOOK_SECRET = `whsec_${btoa("lendloop-test-webhook-secret-32b")}`;

function sendClerkEvent(
  t: TestBackend,
  messageId: string,
  event: object,
  signature?: string,
) {
  const body = JSON.stringify(event);
  const sentAt = new Date();

  return t.fetch(HTTP_ROUTES.clerkWebhook, {
    method: "POST",
    headers: {
      "svix-id": messageId,
      "svix-timestamp": String(unixSeconds(sentAt.getTime())),
      "svix-signature":
        signature ?? new Webhook(WEBHOOK_SECRET).sign(messageId, sentAt, body),
    },
    body,
  });
}

describe("Clerk webhooks", () => {
  it("verifies signatures and anonymizes deleted accounts", async () => {
    vi.stubEnv("CLERK_WEBHOOK_SECRET", WEBHOOK_SECRET);

    const { t, alice } = await setupNeighbors();
    const deletion = { type: "user.deleted", data: { id: "user_alice" } };

    await alice.mutation(api.tools.create, TOOL);

    const forged = await sendClerkEvent(t, "msg_1", deletion, "v1,AAAA");
    const accepted = await sendClerkEvent(t, "msg_1", deletion);

    expect(forged.status).toBe(401);
    expect(accepted.status).toBe(200);

    const aliceId = await userIdOf(t, "user_alice");
    const aliceRecord = await t.run((ctx) => ctx.db.get("users", aliceId));

    expect(aliceRecord).toMatchObject({ name: "Deleted user" });
    expect(await t.query(api.tools.listPublicBoard, {})).toHaveLength(0);

    await expect(alice.mutation(api.tools.create, TOOL)).rejects.toThrow(
      /deleted/,
    );
  });

  it("ignores other Clerk events and records a repeated deletion only once", async () => {
    vi.stubEnv("CLERK_WEBHOOK_SECRET", WEBHOOK_SECRET);

    const { t } = await setupNeighbors();
    const bobId = await userIdOf(t, "user_bob");
    const update = { type: "user.updated", data: { id: "user_bob" } };
    const deletion = { type: "user.deleted", data: { id: "user_bob" } };

    const ignored = await sendClerkEvent(t, "msg_a", update);

    expect(ignored.status).toBe(200);

    expect((await t.run((ctx) => ctx.db.get("users", bobId)))?.name).toBe(
      "Bob",
    );

    await sendClerkEvent(t, "msg_b", deletion);
    await sendClerkEvent(t, "msg_c", deletion);

    const deletions = await t.run(async (ctx) => {
      const audit = await ctx.db.query("auditEvents").collect();

      return audit.filter((entry) => entry.action === "account_deleted");
    });

    expect(deletions).toHaveLength(1);
  });
});
