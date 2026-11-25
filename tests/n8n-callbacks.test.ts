// @vitest-environment edge-runtime
import { describe, expect, it, vi } from "vitest";
import { api, internal } from "../convex/_generated/api";
import { HTTP_LIMITS } from "../convex/lib/config";
import { unixSeconds } from "../convex/lib/dates";
import { formatSignature, signHmacSha256 } from "../convex/lib/hmac";
import { HTTP_ROUTES, SIGNATURE_HEADERS } from "../convex/lib/httpRoutes";
import {
  createBackend,
  requestLoan,
  setupNeighbors,
  TOOL,
  useFrozenClock,
} from "./support/backend";

useFrozenClock();

const CALLBACK_SECRET = "c".repeat(64);

async function signedHeaders(body: string) {
  const timestamp = String(unixSeconds());
  const signature = await signHmacSha256(CALLBACK_SECRET, timestamp, body);

  return {
    [SIGNATURE_HEADERS.timestamp]: timestamp,
    [SIGNATURE_HEADERS.signature]: formatSignature(signature),
  };
}

describe("n8n write-backs", () => {
  it("records due-soon and overdue reminders once and only for matching loans", async () => {
    const { t, alice, bob } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const loanId = await requestLoan(bob, toolId, "2026-11-19", "2026-11-20");
    const dueSoon = { loanId, tomorrow: "2026-11-20" };

    await alice.mutation(api.loans.approve, { loanId });
    await alice.mutation(api.loans.confirmHandover, { loanId });

    const dueSoonLoans = await t.query(internal.n8n.listDueSoonLoans, {
      tomorrow: dueSoon.tomorrow,
    });

    expect(dueSoonLoans.map((loan) => loan.loanId)).toEqual([loanId]);

    const dueFirst = await t.mutation(
      internal.n8n.recordDueSoonReminder,
      dueSoon,
    );

    const dueRetry = await t.mutation(
      internal.n8n.recordDueSoonReminder,
      dueSoon,
    );

    expect(dueFirst).toMatchObject({ deduplicated: false });
    expect(dueRetry).toMatchObject({ deduplicated: true });

    const notOverdueYet = await t.mutation(internal.n8n.recordOverdueReminder, {
      loanId,
      today: "2026-11-20",
    });

    const unknownLoan = await t.mutation(internal.n8n.recordOverdueReminder, {
      loanId: "not-an-id",
      today: "2026-11-22",
    });

    expect(notOverdueYet).toBeNull();
    expect(unknownLoan).toBeNull();

    const overdue = { loanId, today: "2026-11-22" };
    const first = await t.mutation(internal.n8n.recordOverdueReminder, overdue);
    const retry = await t.mutation(internal.n8n.recordOverdueReminder, overdue);

    expect(first).toMatchObject({ deduplicated: false });
    expect(retry).toMatchObject({ deduplicated: true });
  });

  it("rejects unsigned, oversized and cross-endpoint replayed n8n callbacks", async () => {
    vi.stubEnv("N8N_CALLBACK_SECRET", CALLBACK_SECRET);

    const t = createBackend();
    const body = JSON.stringify({ executionId: "exec-1", summary: "boom" });
    const headers = await signedHeaders(body);
    const errorEndpoint = HTTP_ROUTES.automationError;

    const unsigned = await t.fetch(errorEndpoint, { method: "POST", body });

    const oversized = await t.fetch(errorEndpoint, {
      method: "POST",
      headers,
      body: "x".repeat(HTTP_LIMITS.n8nCallbackBodyBytes + 1),
    });

    const replayedElsewhere = await t.fetch(HTTP_ROUTES.overdueLoans, {
      method: "GET",
      headers,
    });

    expect(unsigned.status).toBe(401);
    expect(oversized.status).toBe(413);
    expect(replayedElsewhere.status).toBe(401);

    const signedRequest = { method: "POST", headers, body };
    const first = await t.fetch(errorEndpoint, signedRequest);
    const retry = await t.fetch(errorEndpoint, signedRequest);

    expect(await first.json()).toMatchObject({ deduplicated: false });
    expect(await retry.json()).toMatchObject({ deduplicated: true });
  });

  it("serves the overdue list to a correctly signed GET request", async () => {
    vi.stubEnv("N8N_CALLBACK_SECRET", CALLBACK_SECRET);

    const t = createBackend();
    const headers = await signedHeaders(`GET:${HTTP_ROUTES.overdueLoans}`);

    const response = await t.fetch(HTTP_ROUTES.overdueLoans, {
      method: "GET",
      headers,
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ count: 0, loans: [] });
  });

  it("serves loans due tomorrow and rejects bad or mismatched write-backs", async () => {
    vi.stubEnv("N8N_CALLBACK_SECRET", CALLBACK_SECRET);

    const { t, alice, bob } = await setupNeighbors();
    const toolId = await alice.mutation(api.tools.create, TOOL);
    const loanId = await requestLoan(bob, toolId, "2026-11-19", "2026-11-20");

    await alice.mutation(api.loans.approve, { loanId });
    await alice.mutation(api.loans.confirmHandover, { loanId });

    const listing = await t.fetch(HTTP_ROUTES.dueSoonLoans, {
      method: "GET",
      headers: await signedHeaders(`GET:${HTTP_ROUTES.dueSoonLoans}`),
    });

    expect(await listing.json()).toMatchObject({
      dueDate: "2026-11-20",
      count: 1,
    });

    const post = async (path: string, payload: object) => {
      const body = JSON.stringify(payload);

      return await t.fetch(path, {
        method: "POST",
        headers: await signedHeaders(body),
        body,
      });
    };

    const missingId = await post(HTTP_ROUTES.dueSoonReminderSent, {});
    const notOverdue = await post(HTTP_ROUTES.overdueReminderSent, { loanId });
    const recorded = await post(HTTP_ROUTES.dueSoonReminderSent, { loanId });

    const missingSummary = await post(HTTP_ROUTES.automationError, {
      executionId: "exec-2",
    });

    expect(missingId.status).toBe(400);
    expect(notOverdue.status).toBe(409);
    expect(recorded.status).toBe(200);
    expect(missingSummary.status).toBe(400);
  });
});
