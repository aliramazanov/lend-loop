import { Webhook, WebhookVerificationError } from "svix";
import { internal } from "../_generated/api";
import { ActionCtx } from "../_generated/server";
import { HTTP_LIMITS } from "../lib/config";
import { clerkWebhookSecret } from "../lib/env";
import {
  errorResponse,
  HTTP_STATUS,
  jsonResponse,
  objectField,
  parseJsonObject,
  stringField,
} from "../lib/httpResponses";

function svixHeaders(request: Request) {
  return {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  };
}

function isSignedByClerk(secret: string, rawBody: string, request: Request) {
  try {
    new Webhook(secret).verify(rawBody, svixHeaders(request));

    return true;
  } catch (error) {
    if (error instanceof WebhookVerificationError) return false;

    throw error;
  }
}

function deletedUserId(rawBody: string): string | undefined {
  const event = parseJsonObject(rawBody);

  if (stringField(event, "type") !== "user.deleted") return undefined;

  return stringField(objectField(event, "data"), "id");
}

export async function handleClerkWebhook(ctx: ActionCtx, request: Request) {
  const secret = clerkWebhookSecret();

  if (!secret) {
    console.error("clerk_webhook_misconfigured");

    return errorResponse("Server misconfigured", HTTP_STATUS.serverError);
  }

  const rawBody = await request.text();

  if (rawBody.length > HTTP_LIMITS.clerkWebhookBodyBytes) {
    return errorResponse("Payload too large", HTTP_STATUS.payloadTooLarge);
  }

  if (!isSignedByClerk(secret, rawBody, request)) {
    console.warn("clerk_webhook_rejected reason=signature");

    return errorResponse("Invalid signature", HTTP_STATUS.unauthorized);
  }

  const clerkId = deletedUserId(rawBody);

  if (clerkId) {
    await ctx.runMutation(internal.users.anonymizeDeletedAccount, { clerkId });
  }

  return jsonResponse({ received: true });
}
