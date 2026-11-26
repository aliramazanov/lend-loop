/*
 * JSON responses for the HTTP routes, and safe parsing of request bodies.
 * Field readers return nothing instead of throwing when a payload has the wrong shape.
 */

export const HTTP_STATUS = {
  ok: 200,
  badRequest: 400,
  unauthorized: 401,
  conflict: 409,
  payloadTooLarge: 413,
  serviceUnavailable: 503,
} as const;

export function jsonResponse(data: unknown, status: number = HTTP_STATUS.ok) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status: number) {
  return jsonResponse({ error: message }, status);
}

export function parseJsonObject(rawBody: string): object | null {
  try {
    const parsed: unknown = JSON.parse(rawBody);

    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

export function objectField(body: object | null, field: string) {
  const value: unknown = body ? Reflect.get(body, field) : undefined;

  return typeof value === "object" && value !== null ? value : null;
}

export function stringField(body: object | null, field: string) {
  const value: unknown = body ? Reflect.get(body, field) : undefined;

  return typeof value === "string" ? value : undefined;
}
