/*
 * HTTP routes for outside services.
 *
 * The n8n routes accept a request only when its HMAC signature and timestamp check out,
 * using a secret that differs from the one Convex signs outgoing events with.
 * The Clerk route accepts only events with a valid Svix signature.
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { HTTP_ROUTES } from "./lib/httpRoutes";
import { handleClerkWebhook } from "./webhooks/clerkWebhook";
import {
  listDueSoonLoans,
  listOverdueLoans,
  recordDueSoonReminder,
  recordOverdueReminder,
  recordWorkflowError,
} from "./webhooks/n8nCallbacks";

const http = httpRouter();

http.route({
  path: HTTP_ROUTES.overdueLoans,
  method: "GET",
  handler: httpAction(listOverdueLoans),
});

http.route({
  path: HTTP_ROUTES.overdueReminderSent,
  method: "POST",
  handler: httpAction(recordOverdueReminder),
});

http.route({
  path: HTTP_ROUTES.dueSoonLoans,
  method: "GET",
  handler: httpAction(listDueSoonLoans),
});

http.route({
  path: HTTP_ROUTES.dueSoonReminderSent,
  method: "POST",
  handler: httpAction(recordDueSoonReminder),
});

http.route({
  path: HTTP_ROUTES.automationError,
  method: "POST",
  handler: httpAction(recordWorkflowError),
});

http.route({
  path: HTTP_ROUTES.clerkWebhook,
  method: "POST",
  handler: httpAction(handleClerkWebhook),
});

export default http;
