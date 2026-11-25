import { HTTP_LIMITS } from "../lib/config";
import { n8nCallbackSecret } from "../lib/env";
import { verifyHmacSha256 } from "../lib/hmac";
import { errorResponse, HTTP_STATUS } from "../lib/httpResponses";
import { SIGNATURE_HEADERS } from "../lib/httpRoutes";

export type SignedRequest =
  { ok: true; rawBody: string } | { ok: false; response: Response };

function signedPayload(request: Request, rawBody: string): string {
  const { pathname } = new URL(request.url);

  return request.method === "GET" ? `GET:${pathname}` : rawBody;
}

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

    return reject("Server misconfigured", HTTP_STATUS.serverError);
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
    body: signedPayload(request, rawBody),
  });

  if (!verification.ok) {
    console.warn(
      `n8n_callback_rejected path=${pathname} reason="${verification.reason}"`,
    );

    return reject("Invalid signature", HTTP_STATUS.unauthorized);
  }

  return { ok: true, rawBody };
}
