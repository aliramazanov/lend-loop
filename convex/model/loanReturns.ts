import { ConvexError } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { enforceRateLimit } from "../lib/rateLimiter";
import { normalizeText, stripHiddenCharacters } from "../lib/text";
import { RETURN_CONDITION_LABELS } from "../shared/catalog";
import { LOAN_POLICY } from "../shared/policy";
import { recordAudit } from "./audit";
import { assertLoanStatus, requireLoanRole } from "./loanAccess";
import { loansForTool } from "./loanStore";
import {
  declineRequests,
  notifyLoanChange,
  transitionLoan,
} from "./loanTransitions";
import type { AuditReportedIssueArgs, ReturnReport } from "../types";

function cleanNote(note: string | undefined): string {
  const text = normalizeText(stripHiddenCharacters(note ?? ""));

  return text.slice(0, LOAN_POLICY.maxNoteLength);
}

async function auditReportedIssue(
  ctx: MutationCtx,
  loan: Doc<"loans">,
  report: AuditReportedIssueArgs,
) {
  const lender = await ctx.db.get("users", loan.lenderId);
  const tool = await ctx.db.get("tools", loan.toolId);
  const lenderName = lender?.name ?? "A lender";
  const toolName = tool?.name ?? "a tool";

  await recordAudit(ctx, {
    actorId: loan.lenderId,
    action: "loan_issue_reported",
    targetType: "loan",
    targetId: loan._id,
    summary: `${lenderName} reported "${toolName}" as ${report.condition}: ${report.note}`,
    detail: `${RETURN_CONDITION_LABELS[report.condition]}: ${report.note}`,
  });
}

async function withdrawMissingTool(ctx: MutationCtx, loan: Doc<"loans">) {
  const now = Date.now();

  await ctx.db.patch("tools", loan.toolId, { archivedAt: now, updatedAt: now });

  const pending = await loansForTool(ctx, loan.toolId, "pending");
  const upcoming = await loansForTool(ctx, loan.toolId, "approved");

  await declineRequests(ctx, pending, "loan_withdrawn");

  for (const booking of upcoming) {
    await transitionLoan(ctx, booking, {
      status: "cancelled",
      event: "loan_cancelled",
      recipientId: booking.borrowerId,
    });
  }
}

export async function claimReturn(ctx: MutationCtx, loanId: Id<"loans">) {
  const { user, loan } = await requireLoanRole(ctx, loanId, {
    role: "borrower",
    deniedReason: "Only the borrower can do this.",
  });

  if (loan.status !== "active") {
    throw new ConvexError("Only active loans can be returned.");
  }

  await enforceRateLimit(ctx, "loanDecision", user._id);

  if (loan.returnClaimedAt) return;

  const now = Date.now();

  await ctx.db.patch("loans", loan._id, {
    returnClaimedAt: now,
    updatedAt: now,
  });

  await notifyLoanChange(ctx, {
    loan,
    event: "loan_return_claimed",
    recipientId: loan.lenderId,
  });
}

export async function recordReturn(
  ctx: MutationCtx,
  loan: Doc<"loans">,
  report: Omit<ReturnReport, "loanId">,
) {
  const note = cleanNote(report.note);
  const reportsIssue = report.condition !== "as_expected";

  if (reportsIssue && note.length < LOAN_POLICY.minIssueNoteLength) {
    throw new ConvexError(
      `Describe what happened in at least ${LOAN_POLICY.minIssueNoteLength} characters.`,
    );
  }

  await transitionLoan(ctx, loan, {
    status: "returned",
    event: "loan_returned",
    recipientId: loan.borrowerId,
    fields: {
      returnedAt: Date.now(),
      returnCondition: report.condition,
      returnNote: note || undefined,
    },
  });

  if (reportsIssue) {
    await auditReportedIssue(ctx, loan, { condition: report.condition, note });
  }

  if (report.condition === "missing") {
    await withdrawMissingTool(ctx, loan);
  }
}

export async function confirmReturn(ctx: MutationCtx, report: ReturnReport) {
  const { user, loan } = await requireLoanRole(ctx, report.loanId, {
    role: "lender",
    deniedReason: "Only the tool owner can confirm a return.",
  });

  assertLoanStatus(loan, "active");

  await enforceRateLimit(ctx, "loanDecision", user._id);
  await recordReturn(ctx, loan, report);
}
