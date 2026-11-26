/*
 * How a loan's state is shown.
 *
 * loanStage: the label and color, including derived stages such as overdue, awaiting
 * handover and returned damaged.
 * statusLabel: the plain name of a status, used by the admin charts.
 * reminderNote: when the last reminder went out.
 */

import { daysSince } from "./dates";
import type { LoanStage, StageInput } from "@/types";
import type { LoanStatus } from "@convex/types";

const STATUS_STAGES: Record<LoanStatus, LoanStage> = {
  pending: { tone: "warning", label: "Pending" },
  approved: { tone: "info", label: "Upcoming" },
  active: { tone: "success", label: "On loan" },
  declined: { tone: "danger", label: "Declined" },
  returned: { tone: "neutral", label: "Returned" },
  cancelled: { tone: "quiet", label: "Cancelled" },
  expired: { tone: "quiet", label: "Expired" },
};

export function statusLabel(status: LoanStatus): string {
  return STATUS_STAGES[status].label;
}

export function loanStage(loan: StageInput): LoanStage {
  if (loan.status === "approved" && loan.hasStarted) {
    return { tone: "info", label: "Awaiting handover" };
  }

  if (loan.status === "active" && loan.isOverdue) {
    return { tone: "danger", label: "Overdue" };
  }

  if (loan.status === "returned" && loan.returnCondition === "damaged") {
    return { tone: "danger", label: "Returned damaged" };
  }

  if (loan.status === "returned" && loan.returnCondition === "missing") {
    return { tone: "danger", label: "Not returned" };
  }

  return STATUS_STAGES[loan.status];
}

export function reminderNote(lastReminderAt: number | null): string | null {
  if (!lastReminderAt) return null;

  const days = daysSince(lastReminderAt);

  if (days <= 0) return "Reminder sent today";

  return days === 1
    ? "Reminder sent 1 day ago"
    : `Reminder sent ${days} days ago`;
}
