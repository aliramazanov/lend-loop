/*
 * Daily background jobs.
 *
 * Expiry: requests nobody answered and approved loans never picked up are closed.
 * Escalation: loans several days overdue are flagged to admins by email.
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "expire stale borrow requests",
  { hourUTC: 0, minuteUTC: 5 },
  internal.loans.expireStaleLoans,
);

crons.daily(
  "escalate long-overdue loans to admins",
  { hourUTC: 9, minuteUTC: 0 },
  internal.loans.escalateOverdueLoans,
);

export default crons;
