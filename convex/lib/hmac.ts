/*
 * HMAC-SHA256 signing and checking for calls between Convex and n8n.
 *
 * signHmacSha256: signs the timestamp together with the body.
 * canonicalRequest: the signed text for a call into Convex: method, path and body, so a
 * signature made for one route is useless on any other.
 * verifyHmacSha256: rejects a stale or future timestamp to stop replays, then compares the
 * signatures in constant time so timing reveals nothing.
 */

import { SIGNATURE_POLICY } from "./config";
import { unixSeconds } from "./dates";
import type { SignedMessage, VerificationResult } from "../types";

const SIGNATURE_PREFIX = "sha256=";

const HEX_RADIX = 16;

const HEX_DIGITS_PER_BYTE = 2;

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(HEX_RADIX).padStart(HEX_DIGITS_PER_BYTE, "0"),
  ).join("");
}

function isWithinReplayWindow(timestamp: number): boolean {
  const ageSeconds = Math.abs(unixSeconds() - timestamp);

  return ageSeconds <= SIGNATURE_POLICY.replayWindowSeconds;
}

function withoutPrefix(signature: string): string {
  return signature.startsWith(SIGNATURE_PREFIX)
    ? signature.slice(SIGNATURE_PREFIX.length)
    : signature;
}

export function canonicalRequest(
  method: string,
  path: string,
  body: string,
): string {
  return `${method}:${path}:${body}`;
}

export function constantTimeEqual(first: string, second: string): boolean {
  if (first.length !== second.length) return false;

  let mismatch = 0;

  for (let index = 0; index < first.length; index++) {
    mismatch |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }

  return mismatch === 0;
}

export async function signHmacSha256(
  secret: string,
  timestamp: string,
  body: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${timestamp}.${body}`),
  );

  return toHex(signature);
}

export async function verifyHmacSha256({
  secret,
  timestamp,
  signature,
  body,
}: SignedMessage): Promise<VerificationResult> {
  if (!timestamp || !signature) {
    return { ok: false, reason: "Missing signature or timestamp header" };
  }

  const sentAt = Number(timestamp);

  if (!Number.isFinite(sentAt)) {
    return { ok: false, reason: "Invalid timestamp" };
  }

  if (!isWithinReplayWindow(sentAt)) {
    return { ok: false, reason: "Timestamp outside replay window" };
  }

  const expected = await signHmacSha256(secret, timestamp, body);
  const received = withoutPrefix(signature).toLowerCase();

  if (!constantTimeEqual(expected, received)) {
    return { ok: false, reason: "Signature mismatch" };
  }

  return { ok: true };
}

export function formatSignature(signature: string): string {
  return `${SIGNATURE_PREFIX}${signature}`;
}
