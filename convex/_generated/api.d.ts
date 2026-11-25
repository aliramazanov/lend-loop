/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as clerk from "../clerk.js";
import type * as crons from "../crons.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as lib_config from "../lib/config.js";
import type * as lib_dates from "../lib/dates.js";
import type * as lib_env from "../lib/env.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_events from "../lib/events.js";
import type * as lib_hmac from "../lib/hmac.js";
import type * as lib_httpResponses from "../lib/httpResponses.js";
import type * as lib_httpRoutes from "../lib/httpRoutes.js";
import type * as lib_rateLimiter from "../lib/rateLimiter.js";
import type * as lib_text from "../lib/text.js";
import type * as lib_validators from "../lib/validators.js";
import type * as loans from "../loans.js";
import type * as model_accountClosure from "../model/accountClosure.js";
import type * as model_adminOverview from "../model/adminOverview.js";
import type * as model_audit from "../model/audit.js";
import type * as model_auth from "../model/auth.js";
import type * as model_automation from "../model/automation.js";
import type * as model_emailDelivery from "../model/emailDelivery.js";
import type * as model_emailMessages from "../model/emailMessages.js";
import type * as model_emailScheduling from "../model/emailScheduling.js";
import type * as model_loanAccess from "../model/loanAccess.js";
import type * as model_loanAdmin from "../model/loanAdmin.js";
import type * as model_loanEscalation from "../model/loanEscalation.js";
import type * as model_loanEventDelivery from "../model/loanEventDelivery.js";
import type * as model_loanExpiry from "../model/loanExpiry.js";
import type * as model_loanExtensions from "../model/loanExtensions.js";
import type * as model_loanHandshake from "../model/loanHandshake.js";
import type * as model_loanReads from "../model/loanReads.js";
import type * as model_loanRequests from "../model/loanRequests.js";
import type * as model_loanReturns from "../model/loanReturns.js";
import type * as model_loanRules from "../model/loanRules.js";
import type * as model_loanStore from "../model/loanStore.js";
import type * as model_loanTransitions from "../model/loanTransitions.js";
import type * as model_loanViews from "../model/loanViews.js";
import type * as model_moderation from "../model/moderation.js";
import type * as model_reminders from "../model/reminders.js";
import type * as model_toolInput from "../model/toolInput.js";
import type * as model_toolPhotos from "../model/toolPhotos.js";
import type * as model_toolReads from "../model/toolReads.js";
import type * as model_toolStore from "../model/toolStore.js";
import type * as model_toolViews from "../model/toolViews.js";
import type * as model_toolWrites from "../model/toolWrites.js";
import type * as model_users from "../model/users.js";
import type * as n8n from "../n8n.js";
import type * as seed from "../seed.js";
import type * as shared_catalog from "../shared/catalog.js";
import type * as shared_policy from "../shared/policy.js";
import type * as tools from "../tools.js";
import type * as types_audit from "../types/audit.js";
import type * as types_automation from "../types/automation.js";
import type * as types_catalog from "../types/catalog.js";
import type * as types_email from "../types/email.js";
import type * as types_events from "../types/events.js";
import type * as types_index from "../types/index.js";
import type * as types_lib from "../types/lib.js";
import type * as types_loans from "../types/loans.js";
import type * as types_setup from "../types/setup.js";
import type * as types_tools from "../types/tools.js";
import type * as types_users from "../types/users.js";
import type * as types_webhooks from "../types/webhooks.js";
import type * as users from "../users.js";
import type * as webhooks_clerkWebhook from "../webhooks/clerkWebhook.js";
import type * as webhooks_n8nCallbacks from "../webhooks/n8nCallbacks.js";
import type * as webhooks_signedRequest from "../webhooks/signedRequest.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  clerk: typeof clerk;
  crons: typeof crons;
  emails: typeof emails;
  http: typeof http;
  "lib/config": typeof lib_config;
  "lib/dates": typeof lib_dates;
  "lib/env": typeof lib_env;
  "lib/errors": typeof lib_errors;
  "lib/events": typeof lib_events;
  "lib/hmac": typeof lib_hmac;
  "lib/httpResponses": typeof lib_httpResponses;
  "lib/httpRoutes": typeof lib_httpRoutes;
  "lib/rateLimiter": typeof lib_rateLimiter;
  "lib/text": typeof lib_text;
  "lib/validators": typeof lib_validators;
  loans: typeof loans;
  "model/accountClosure": typeof model_accountClosure;
  "model/adminOverview": typeof model_adminOverview;
  "model/audit": typeof model_audit;
  "model/auth": typeof model_auth;
  "model/automation": typeof model_automation;
  "model/emailDelivery": typeof model_emailDelivery;
  "model/emailMessages": typeof model_emailMessages;
  "model/emailScheduling": typeof model_emailScheduling;
  "model/loanAccess": typeof model_loanAccess;
  "model/loanAdmin": typeof model_loanAdmin;
  "model/loanEscalation": typeof model_loanEscalation;
  "model/loanEventDelivery": typeof model_loanEventDelivery;
  "model/loanExpiry": typeof model_loanExpiry;
  "model/loanExtensions": typeof model_loanExtensions;
  "model/loanHandshake": typeof model_loanHandshake;
  "model/loanReads": typeof model_loanReads;
  "model/loanRequests": typeof model_loanRequests;
  "model/loanReturns": typeof model_loanReturns;
  "model/loanRules": typeof model_loanRules;
  "model/loanStore": typeof model_loanStore;
  "model/loanTransitions": typeof model_loanTransitions;
  "model/loanViews": typeof model_loanViews;
  "model/moderation": typeof model_moderation;
  "model/reminders": typeof model_reminders;
  "model/toolInput": typeof model_toolInput;
  "model/toolPhotos": typeof model_toolPhotos;
  "model/toolReads": typeof model_toolReads;
  "model/toolStore": typeof model_toolStore;
  "model/toolViews": typeof model_toolViews;
  "model/toolWrites": typeof model_toolWrites;
  "model/users": typeof model_users;
  n8n: typeof n8n;
  seed: typeof seed;
  "shared/catalog": typeof shared_catalog;
  "shared/policy": typeof shared_policy;
  tools: typeof tools;
  "types/audit": typeof types_audit;
  "types/automation": typeof types_automation;
  "types/catalog": typeof types_catalog;
  "types/email": typeof types_email;
  "types/events": typeof types_events;
  "types/index": typeof types_index;
  "types/lib": typeof types_lib;
  "types/loans": typeof types_loans;
  "types/setup": typeof types_setup;
  "types/tools": typeof types_tools;
  "types/users": typeof types_users;
  "types/webhooks": typeof types_webhooks;
  users: typeof users;
  "webhooks/clerkWebhook": typeof webhooks_clerkWebhook;
  "webhooks/n8nCallbacks": typeof webhooks_n8nCallbacks;
  "webhooks/signedRequest": typeof webhooks_signedRequest;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
