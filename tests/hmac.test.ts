import { describe, expect, it } from "vitest";
import { SIGNATURE_POLICY } from "../convex/lib/config";
import { unixSeconds } from "../convex/lib/dates";
import {
  formatSignature,
  signHmacSha256,
  verifyHmacSha256,
} from "../convex/lib/hmac";

const SECRET = "test-only-shared-secret".repeat(3);

const PAYLOAD = JSON.stringify({
  loanId: "loan_123",
  idempotencyKey: "reminder:loan_123:2026-11-19",
  summary: "Overdue reminder sent",
});

describe("HMAC-SHA256 webhook and callback verification", () => {
  it("verifies a valid signature with sha256= prefix within replay window", async () => {
    const timestamp = String(unixSeconds());
    const signature = await signHmacSha256(SECRET, timestamp, PAYLOAD);

    const result = await verifyHmacSha256({
      secret: SECRET,
      timestamp,
      signature: formatSignature(signature),
      body: PAYLOAD,
    });

    expect(result).toEqual({ ok: true });
  });

  it("rejects tampered payloads and signatures made with the wrong secret", async () => {
    const timestamp = String(unixSeconds());
    const signature = await signHmacSha256(SECRET, timestamp, PAYLOAD);
    const forged = await signHmacSha256("wrong_secret", timestamp, PAYLOAD);

    const tampered = await verifyHmacSha256({
      secret: SECRET,
      timestamp,
      signature: formatSignature(signature),
      body: PAYLOAD.replace("loan_123", "loan_999"),
    });

    const wrongSecret = await verifyHmacSha256({
      secret: SECRET,
      timestamp,
      signature: formatSignature(forged),
      body: PAYLOAD,
    });

    expect(tampered).toEqual({ ok: false, reason: "Signature mismatch" });
    expect(wrongSecret).toEqual({ ok: false, reason: "Signature mismatch" });
  });

  it("rejects stale timestamps and missing signature headers", async () => {
    const staleAt = unixSeconds() - SIGNATURE_POLICY.replayWindowSeconds - 1;
    const timestamp = String(staleAt);
    const signature = await signHmacSha256(SECRET, timestamp, PAYLOAD);

    const stale = await verifyHmacSha256({
      secret: SECRET,
      timestamp,
      signature: formatSignature(signature),
      body: PAYLOAD,
    });

    const missing = await verifyHmacSha256({
      secret: SECRET,
      timestamp: null,
      signature: null,
      body: PAYLOAD,
    });

    expect(stale).toEqual({
      ok: false,
      reason: "Timestamp outside replay window",
    });

    expect(missing).toEqual({
      ok: false,
      reason: "Missing signature or timestamp header",
    });
  });
});
