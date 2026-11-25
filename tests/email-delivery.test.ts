// @vitest-environment edge-runtime
import { describe, expect, it, vi } from "vitest";
import { api, internal } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import {
  CLERK_API_URL,
  EMAIL_DELIVERY,
  RESEND_API_URL,
} from "../convex/lib/config";
import { composeEmail } from "../convex/model/emailMessages";
import {
  requestLoan,
  setupNeighbors,
  TOOL,
  useFrozenClock,
  userIdOf,
  type TestBackend,
} from "./support/backend";
import { stubFetch } from "./support/fetchStub";

useFrozenClock();

const SENDER = "LendLoop <hello@lendloop.example>";
const INTERNAL_ERROR = 500;
const NOT_FOUND = 404;

function configureEmail() {
  vi.stubEnv("RESEND_API_KEY", "re_test_placeholder");
  vi.stubEnv("EMAIL_FROM", SENDER);
  vi.stubEnv("CLERK_SECRET_KEY", "sk_test_placeholder");
}

function clerkUser(request: Request) {
  const clerkId = request.url.split("/").at(-1) ?? "";

  return Response.json({
    id: clerkId,
    primary_email_address_id: "idn_primary",
    email_addresses: [
      { id: "idn_other", email_address: `old-${clerkId}@example.com` },
      { id: "idn_primary", email_address: `${clerkId}@example.com` },
    ],
  });
}

function respondWith(resendStatus: number, clerkStatus = 200) {
  return stubFetch((request) => {
    if (request.url.startsWith(CLERK_API_URL)) {
      return clerkStatus === 200
        ? clerkUser(request)
        : new Response(null, { status: clerkStatus });
    }

    return new Response("{}", { status: resendStatus });
  });
}

function resendCalls(requests: Request[]) {
  return requests.filter((request) => request.url === RESEND_API_URL);
}

async function eventTypes(t: TestBackend, loanId: Id<"loans">) {
  const events = await t.run(async (ctx) =>
    ctx.db
      .query("automationEvents")
      .withIndex("by_loan", (q) => q.eq("loanId", loanId))
      .collect(),
  );

  return events.map((event) => event.eventType);
}

async function requestDrill() {
  const neighbors = await setupNeighbors();
  const toolId = await neighbors.alice.mutation(api.tools.create, TOOL);

  const loanId = await requestLoan(
    neighbors.bob,
    toolId,
    "2026-11-20",
    "2026-11-21",
  );

  return { ...neighbors, loanId };
}

describe("email delivery", () => {
  it("emails the owner about a new request without storing the address", async () => {
    configureEmail();

    const requests = respondWith(200);
    const { t, loanId } = await requestDrill();

    await t.finishAllScheduledFunctions(vi.runAllTimers);

    const [sent] = resendCalls(requests);
    const body = JSON.stringify(await sent.json());

    expect(sent.headers.get("Idempotency-Key")).toBeTruthy();
    expect(body).toContain('"to":["user_alice@example.com"]');
    expect(body).toContain(`"from":"${SENDER}"`);
    expect(body).toContain("New request for Cordless Drill");
    expect(await eventTypes(t, loanId)).toContain("email_sent");

    const stored = JSON.stringify(
      await t.run((ctx) => ctx.db.query("users").collect()),
    );

    expect(stored).not.toContain("@example.com");
  });

  it("retries a failing send and records the failure", async () => {
    configureEmail();

    const requests = respondWith(INTERNAL_ERROR);
    const { t, loanId } = await requestDrill();

    await t.finishAllScheduledFunctions(vi.runAllTimers);

    expect(resendCalls(requests)).toHaveLength(EMAIL_DELIVERY.maxAttempts);
    expect(await eventTypes(t, loanId)).toContain("email_failed");
  });

  it("skips neighbors Clerk does not know, such as the demo seed accounts", async () => {
    configureEmail();

    const requests = respondWith(200, NOT_FOUND);
    const { t, loanId } = await requestDrill();

    await t.finishAllScheduledFunctions(vi.runAllTimers);

    expect(resendCalls(requests)).toHaveLength(0);
    expect(await eventTypes(t, loanId)).not.toContain("email_sent");
  });

  it("never emails a deleted account", async () => {
    const { t } = await setupNeighbors();

    await t.mutation(internal.users.anonymizeDeletedAccount, {
      clerkId: "user_alice",
    });

    const recipient = await t.query(internal.emails.recipientOf, {
      userId: await userIdOf(t, "user_alice"),
    });

    expect(recipient).toBeNull();
  });

  it("writes a clear message for every kind of event", () => {
    const details = {
      toolName: "Ladder",
      startDate: "2026-11-20",
      endDate: "2026-11-22",
    };

    expect(composeEmail("overdue_reminder", details)).toMatchObject({
      subject: "Ladder is overdue",
    });

    expect(composeEmail("loan_approved", details).text).toContain(
      "pick up Ladder on 2026-11-20",
    );
  });
});
