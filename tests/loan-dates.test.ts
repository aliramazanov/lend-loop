import { describe, expect, it } from "vitest";
import { datesOverlap } from "../convex/lib/dates";
import { assertValidLoanDates } from "../convex/model/loanRules";

const TODAY = "2026-11-19";

function range(startDate: string, endDate: string) {
  return { startDate, endDate };
}

describe("loan date ranges", () => {
  it("accepts valid same-day and multi-day ISO date ranges", () => {
    expect(() =>
      assertValidLoanDates(range("2026-11-19", "2026-11-19"), TODAY),
    ).not.toThrow();

    expect(() =>
      assertValidLoanDates(range("2026-11-19", "2026-11-25"), TODAY),
    ).not.toThrow();
  });

  it("rejects start dates in the past and loans longer than 30 days", () => {
    expect(() =>
      assertValidLoanDates(range("2026-11-18", "2026-11-20"), TODAY),
    ).toThrow(/cannot be in the past/);

    expect(() =>
      assertValidLoanDates(range("2026-11-19", "2026-12-18"), TODAY),
    ).not.toThrow();

    expect(() =>
      assertValidLoanDates(range("2026-11-19", "2026-12-19"), TODAY),
    ).toThrow(/at most 30 days/);
  });

  it("rejects impossible calendar dates, loose formats and inverted ranges", () => {
    expect(() =>
      assertValidLoanDates(range("2026-02-31", "2026-03-02"), "2026-01-01"),
    ).toThrow(/valid calendar dates/);

    expect(() =>
      assertValidLoanDates(range("2026-4-30", "2026-05-02"), "2026-01-01"),
    ).toThrow(/valid calendar dates/);

    expect(() =>
      assertValidLoanDates(range("2026-11-25", "2026-11-19"), TODAY),
    ).toThrow(/on or after start date/);
  });

  it("detects overlapping, boundary-touching and disjoint ranges", () => {
    const booked = range("2026-11-10", "2026-11-15");

    expect(datesOverlap(booked, range("2026-11-12", "2026-11-18"))).toBe(true);
    expect(datesOverlap(booked, range("2026-11-15", "2026-11-20"))).toBe(true);
    expect(datesOverlap(booked, range("2026-11-16", "2026-11-20"))).toBe(false);
  });
});
