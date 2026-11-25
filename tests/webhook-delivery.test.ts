// @vitest-environment edge-runtime
import { describe, expect, it, vi } from "vitest";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { N8N_DELIVERY } from "../convex/lib/config";
import { verifyHmacSha256 } from "../convex/lib/hmac";
import { parseJsonObject, stringField } from "../convex/lib/httpResponses";
import { SIGNATURE_HEADERS } from "../convex/lib/httpRoutes";
import {
  requestLoan,
  setupNeighbors,
  TOOL,
  useFrozenClock,
  type TestBackend,
} from "./support/backend";
import { stubFetch } from "./support/fetchStub";

useFrozenClock();

const WEBHOOK_URL = "https://n8n.example.test/webhook/lendloop";
const WEBHOOK_SECRET = "w".repeat(64);
const SERVICE_UNAVAILABLE = 503;

function configureWebhook() {
  vi.stubEnv("N8N_REQUEST_WEBHOOK_URL", WEBHOOK_URL);
  vi.stubEnv("N8N_WEBHOOK_SECRET", WEBHOOK_SECRET);
}

async function automationEvents(t: TestBackend, loanId: Id<"loans">) {
  return await t.run(async (ctx) =>
    ctx.db
      .query("automationEvents")
      .withIndex("by_loan", (q) => q.eq("loanId", loanId))
      .collect(),
  );
}

async function requestFromBob() {
  const { t, alice, bob } = await setupNeighbors();
  const toolId = await alice.mutation(api.tools.create, TOOL);
  const loanId = await requestLoan(bob, toolId, "2026-11-20", "2026-11-21");

  return { t, loanId };
}

describe("loan event delivery to n8n", () => {
  it("records a skipped notification when n8n is not configured", async () => {
    const { t, loanId } = await requestFromBob();

    await t.finishAllScheduledFunctions(vi.runAllTimers);

    const events = await automationEvents(t, loanId);

    expect(events.map((event) => event.eventType)).toEqual(["webhook_skipped"]);
  });

  it("signs the event so n8n can verify it, then records the delivery", async () => {
    configureWebhook();

    const delivered = stubFetch();

    const { t, loanId } = await requestFromBob();

    await t.finishAllScheduledFunctions(vi.runAllTimers);

    const [request] = delivered;

    const payload =
      stringField(parseJsonObject(await request.text()), "payload") ?? "";

    const verification = await verifyHmacSha256({
      secret: WEBHOOK_SECRET,
      timestamp: request.headers.get(SIGNATURE_HEADERS.timestamp),
      signature: request.headers.get(SIGNATURE_HEADERS.signature),
      body: payload,
    });

    expect(request.url).toBe(WEBHOOK_URL);
    expect(verification).toEqual({ ok: true });

    expect(JSON.parse(payload)).toMatchObject({
      eventType: "loan_requested",
      status: "pending",
      recipientName: "Alice",
    });

    expect(payload).not.toMatch(/@|user_/);

    const [event] = await automationEvents(t, loanId);

    expect(event).toMatchObject({
      eventType: "loan_requested",
      summary: "Notification sent (pending)",
    });
  });

  it("retries a failing webhook with backoff and reports the final failure", async () => {
    configureWebhook();

    const attempts = stubFetch(
      () => new Response(null, { status: SERVICE_UNAVAILABLE }),
    );

    const { t, loanId } = await requestFromBob();

    await t.finishAllScheduledFunctions(vi.runAllTimers);

    const [event] = await automationEvents(t, loanId);

    expect(attempts).toHaveLength(N8N_DELIVERY.maxAttempts);
    expect(event.eventType).toBe("workflow_error");

    expect(event.summary).toMatch(
      `failed after ${N8N_DELIVERY.maxAttempts} attempts: n8n responded with HTTP ${SERVICE_UNAVAILABLE}`,
    );
  });
});
