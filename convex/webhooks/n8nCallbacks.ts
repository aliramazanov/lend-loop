import { internal } from "../_generated/api";
import { ActionCtx } from "../_generated/server";
import { HTTP_LIMITS } from "../lib/config";
import { todayUtc, tomorrowUtc } from "../lib/dates";
import {
  errorResponse,
  HTTP_STATUS,
  jsonResponse,
  parseJsonObject,
  stringField,
} from "../lib/httpResponses";
import { verifySignedRequest } from "./signedRequest";

const LOAN_ID_REQUIRED = "loanId is required";

export async function listOverdueLoans(ctx: ActionCtx, request: Request) {
  const verified = await verifySignedRequest(request);

  if (!verified.ok) return verified.response;

  const today = todayUtc();
  const loans = await ctx.runQuery(internal.n8n.listOverdueLoans, { today });

  return jsonResponse({ date: today, count: loans.length, loans });
}

export async function listDueSoonLoans(ctx: ActionCtx, request: Request) {
  const verified = await verifySignedRequest(request);

  if (!verified.ok) return verified.response;

  const tomorrow = tomorrowUtc();

  const loans = await ctx.runQuery(internal.n8n.listDueSoonLoans, {
    tomorrow,
  });

  return jsonResponse({ dueDate: tomorrow, count: loans.length, loans });
}

export async function recordOverdueReminder(ctx: ActionCtx, request: Request) {
  const verified = await verifySignedRequest(request);

  if (!verified.ok) return verified.response;

  const loanId = stringField(parseJsonObject(verified.rawBody), "loanId");

  if (!loanId) {
    return errorResponse(LOAN_ID_REQUIRED, HTTP_STATUS.badRequest);
  }

  const result = await ctx.runMutation(internal.n8n.recordOverdueReminder, {
    loanId,
    today: todayUtc(),
  });

  if (!result) {
    return errorResponse("Loan is not overdue", HTTP_STATUS.conflict);
  }

  return jsonResponse(result);
}

export async function recordDueSoonReminder(ctx: ActionCtx, request: Request) {
  const verified = await verifySignedRequest(request);

  if (!verified.ok) return verified.response;

  const loanId = stringField(parseJsonObject(verified.rawBody), "loanId");

  if (!loanId) {
    return errorResponse(LOAN_ID_REQUIRED, HTTP_STATUS.badRequest);
  }

  const result = await ctx.runMutation(internal.n8n.recordDueSoonReminder, {
    loanId,
    tomorrow: tomorrowUtc(),
  });

  if (!result) {
    return errorResponse("Loan is not due tomorrow", HTTP_STATUS.conflict);
  }

  return jsonResponse(result);
}

export async function recordWorkflowError(ctx: ActionCtx, request: Request) {
  const verified = await verifySignedRequest(request);

  if (!verified.ok) return verified.response;

  const body = parseJsonObject(verified.rawBody);
  const executionId = stringField(body, "executionId");
  const summary = stringField(body, "summary");

  if (!executionId || !summary) {
    return errorResponse(
      "executionId and summary are required",
      HTTP_STATUS.badRequest,
    );
  }

  const result = await ctx.runMutation(internal.n8n.recordWorkflowError, {
    executionId: executionId.slice(0, HTTP_LIMITS.executionIdLength),
    summary: summary.slice(0, HTTP_LIMITS.automationSummaryLength),
    loanId: stringField(body, "loanId"),
  });

  return jsonResponse(result);
}
