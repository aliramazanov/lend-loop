import { describe, expect, it } from "vitest";
import { Doc, Id } from "../convex/_generated/dataModel";
import {
  hasReportedIssue,
  isAwaitingHandover,
  isBeforeHandover,
  isOnLoanToday,
  isOverdue,
  wasReturnedLate,
} from "../convex/model/loanRules";

const TODAY = "2026-11-19";

function loan(fields: Partial<Doc<"loans">>): Doc<"loans"> {
  return {
    _id: "loan" as Id<"loans">,
    _creationTime: 0,
    toolId: "tool" as Id<"tools">,
    lenderId: "lender" as Id<"users">,
    borrowerId: "borrower" as Id<"users">,
    startDate: "2026-11-18",
    endDate: "2026-11-20",
    status: "pending",
    createdAt: 0,
    updatedAt: 0,
    ...fields,
  };
}

describe("loan rules", () => {
  it("treats an approved loan as awaiting handover once its start day arrives", () => {
    expect(isAwaitingHandover(loan({ status: "approved" }), TODAY)).toBe(true);

    expect(
      isAwaitingHandover(
        loan({ status: "approved", startDate: "2026-11-20" }),
        TODAY,
      ),
    ).toBe(false);
  });

  it("counts active loans and started approvals as on loan today", () => {
    expect(isOnLoanToday(loan({ status: "active" }), TODAY)).toBe(true);
    expect(isOnLoanToday(loan({ status: "approved" }), TODAY)).toBe(true);
    expect(isOnLoanToday(loan({ status: "pending" }), TODAY)).toBe(false);
  });

  it("flags only active loans past their end date as overdue", () => {
    const pastEnd = { endDate: "2026-11-18" };

    expect(isOverdue(loan({ ...pastEnd, status: "active" }), TODAY)).toBe(true);

    expect(isOverdue(loan({ ...pastEnd, status: "returned" }), TODAY)).toBe(
      false,
    );
  });

  it("treats requests and approved loans as not yet handed over", () => {
    const awaitingPickup = loan({
      status: "approved",
      startDate: "2026-11-18",
    });

    expect(isBeforeHandover(loan({ status: "pending" }))).toBe(true);
    expect(isBeforeHandover(awaitingPickup)).toBe(true);
    expect(isBeforeHandover(loan({ status: "active" }))).toBe(false);
  });

  it("recognises reported issues and late returns", () => {
    const lateReturn = Date.parse("2026-11-22T09:00:00Z");

    expect(hasReportedIssue(loan({ returnCondition: "damaged" }))).toBe(true);

    expect(hasReportedIssue(loan({ returnCondition: "as_expected" }))).toBe(
      false,
    );

    expect(wasReturnedLate(loan({ returnedAt: lateReturn }))).toBe(true);
  });
});
