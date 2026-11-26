/*
 * Plain rules about a loan's state, shared by actions, lists and reminders.
 * Examples: whether it has started, is overdue or escalated, was returned late, or can
 * still be cancelled.
 * assertValidLoanDates: checks a requested date range against the loan limits.
 */

import { ConvexError } from "convex/values";
import {
  daysInclusive,
  isIsoDate,
  OPEN_ENDED_DATE,
  todayUtc,
} from "../lib/dates";
import { LOAN_POLICY } from "../shared/policy";
import type { DateRange, Loan, LoanStatus } from "../types";

export function hasStarted(loan: Loan, today: string): boolean {
  return loan.startDate <= today;
}

export function isAwaitingHandover(loan: Loan, today: string): boolean {
  return loan.status === "approved" && hasStarted(loan, today);
}

export function isOnLoanToday(loan: Loan, today: string): boolean {
  return loan.status === "active" || isAwaitingHandover(loan, today);
}

export function isOverdue(loan: Loan, today: string): boolean {
  return (
    loan.status === "active" &&
    loan.endDate < today &&
    loan.returnClaimedAt === undefined
  );
}

export function isEscalated(loan: Loan, today: string): boolean {
  return isOverdue(loan, today) && loan.escalatedAt !== undefined;
}

export function isStillOut(loan: Loan, today: string): boolean {
  return loan.status === "active" && loan.endDate < today;
}

export function blockedRange(loan: Loan, today: string): DateRange {
  return {
    startDate: loan.startDate,
    endDate: isStillOut(loan, today) ? OPEN_ENDED_DATE : loan.endDate,
  };
}

const OPEN_STATUSES: LoanStatus[] = ["pending", "approved", "active"];

export function isOpen(status: LoanStatus): boolean {
  return OPEN_STATUSES.includes(status);
}

export function isBeforeHandover(loan: Loan): boolean {
  return loan.status === "pending" || loan.status === "approved";
}

export function isStaleRequest(loan: Loan, today: string): boolean {
  return loan.status === "pending" && loan.startDate < today;
}

export function isMissedPickup(loan: Loan, today: string): boolean {
  return loan.status === "approved" && loan.endDate < today;
}

export function hasReportedIssue(loan: Loan): boolean {
  return (
    loan.returnCondition !== undefined && loan.returnCondition !== "as_expected"
  );
}

export function wasReturnedLate(loan: Loan): boolean {
  const handedBackAt = loan.returnClaimedAt ?? loan.returnedAt;

  return handedBackAt !== undefined && todayUtc(handedBackAt) > loan.endDate;
}

export function assertValidLoanDates(range: DateRange, earliestStart: string) {
  if (!isIsoDate(range.startDate) || !isIsoDate(range.endDate)) {
    throw new ConvexError(
      "Dates must be valid calendar dates in YYYY-MM-DD format.",
    );
  }

  if (range.startDate < earliestStart) {
    throw new ConvexError("Start date cannot be in the past.");
  }

  if (range.startDate > range.endDate) {
    throw new ConvexError("End date must be on or after start date.");
  }

  if (daysInclusive(range) > LOAN_POLICY.maxDays) {
    throw new ConvexError(
      `Loans can last at most ${LOAN_POLICY.maxDays} days.`,
    );
  }
}
