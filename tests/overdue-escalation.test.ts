// @vitest-environment edge-runtime
import { describe, expect, it, vi } from "vitest";
import { api, internal } from "../convex/_generated/api";
import { CLERK_API_URL, RESEND_API_URL } from "../convex/lib/config";
import {
  loanOf,
  promoteToAdmin,
  requestLoan,
  setupNeighbors,
  TOOL,
  useFrozenClock,
} from "./support/backend";
import { stubFetch } from "./support/fetchStub";

useFrozenClock();

async function overdueLoan() {
  const neighbors = await setupNeighbors();
  const { t, alice, bob } = neighbors;
  const toolId = await alice.mutation(api.tools.create, TOOL);
  const loanId = await requestLoan(bob, toolId, "2026-11-19", "2026-11-20");

  await alice.mutation(api.loans.approve, { loanId });
  await alice.mutation(api.loans.confirmHandover, { loanId });
  await promoteToAdmin(t, "user_carol");

  return { ...neighbors, loanId };
}

describe("overdue escalation", () => {
  it("waits until a loan is three days overdue", async () => {
    const { t, loanId } = await overdueLoan();

    vi.setSystemTime(new Date("2026-11-22T10:00:00Z"));

    const result = await t.mutation(internal.loans.escalateOverdueLoans, {});

    expect(result.escalated).toBe(0);
    expect((await loanOf(t, loanId))?.escalatedAt).toBeUndefined();
  });

  it("escalates once to the admins and stops the borrower's reminders", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_placeholder");
    vi.stubEnv("EMAIL_FROM", "LendLoop <hello@lendloop.example>");
    vi.stubEnv("CLERK_SECRET_KEY", "sk_test_placeholder");

    const requests = stubFetch((request) => {
      if (!request.url.startsWith(CLERK_API_URL)) return Response.json({});

      const clerkId = request.url.split("/").at(-1) ?? "";

      return Response.json({
        primary_email_address_id: "idn_primary",
        email_addresses: [
          { id: "idn_primary", email_address: `${clerkId}@example.com` },
        ],
      });
    });

    const { t, carol, loanId } = await overdueLoan();

    await t.finishAllScheduledFunctions(vi.runAllTimers);
    requests.length = 0;

    vi.setSystemTime(new Date("2026-11-23T10:00:00Z"));

    const first = await t.mutation(internal.loans.escalateOverdueLoans, {});
    const second = await t.mutation(internal.loans.escalateOverdueLoans, {});

    await t.finishAllScheduledFunctions(vi.runAllTimers);

    expect(first.escalated).toBe(1);
    expect(second.escalated).toBe(0);

    const emails = await Promise.all(
      requests
        .filter((request) => request.url === RESEND_API_URL)
        .map(async (request) => JSON.stringify(await request.json())),
    );

    expect(emails).toHaveLength(1);
    expect(emails[0]).toContain("user_carol@example.com");
    expect(emails[0]).toContain("Escalated: Cordless Drill is still overdue");

    const overdue = await t.query(internal.n8n.listOverdueLoans, {
      today: "2026-11-23",
    });

    const reminder = await t.mutation(internal.n8n.recordOverdueReminder, {
      loanId,
      today: "2026-11-23",
    });

    expect(overdue).toEqual([]);
    expect(reminder).toBeNull();

    const overview = await carol.query(api.admin.overview, {});
    const [adminLoan] = await carol.query(api.loans.listAllForAdmin, {});

    expect(overview.escalatedLoans).toBe(1);
    expect(adminLoan.isEscalated).toBe(true);
  });
});
