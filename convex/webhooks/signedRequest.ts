/*
 * verifySignedRequest: the gate in front of every n8n route.
 * It rejects missing configuration, oversized bodies and bad or stale signatures before
 * any payload is parsed.
 */

import { HTTP_LIMITS } from "../lib/config";
import { n8nCallbackSecret } from "../lib/env";
import { canonicalRequest, verifyHmacSha256 } from "../lib/hmac";
import { errorResponse, HTTP_STATUS } from "../lib/httpResponses";
import { SIGNATURE_HEADERS } from "../lib/httpRoutes";
import type { SignedRequest } from "../types";

function reject(message: string, status: number): SignedRequest {
  return { ok: false, response: errorResponse(message, status) };
}

export async function verifySignedRequest(
  request: Request,
): Promise<SignedRequest> {
  const { pathname } = new URL(request.url);
  const secret = n8nCallbackSecret();

  if (!secret) {
    console.error(`n8n_callback_misconfigured path=${pathname}`);

    return reject("Service unavailable", HTTP_STATUS.serviceUnavailable);
  }

  const rawBody = await request.text();

  if (rawBody.length > HTTP_LIMITS.n8nCallbackBodyBytes) {
    console.warn(
      `n8n_callback_rejected path=${pathname} reason=body_too_large`,
    );

    return reject("Payload too large", HTTP_STATUS.payloadTooLarge);
  }

  const verification = await verifyHmacSha256({
    secret,
    timestamp: request.headers.get(SIGNATURE_HEADERS.timestamp),
    signature: request.headers.get(SIGNATURE_HEADERS.signature),
    body: canonicalRequest(request.method, pathname, rawBody),
  });

  if (!verification.ok) {
    console.warn(
      `n8n_callback_rejected path=${pathname} reason="${verification.reason}"`,
    );

    return reject("Unauthorized", HTTP_STATUS.unauthorized);
  }

  return { ok: true, rawBody };
}
