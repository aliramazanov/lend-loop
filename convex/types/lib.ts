import type { RATE_LIMITS } from "../lib/rateLimiter";

export interface DateRange {
  startDate: string;
  endDate: string;
}

export type VerificationResult = { ok: true } | { ok: false; reason: string };

export interface SignedMessage {
  secret: string;
  timestamp: string | null;
  signature: string | null;
  body: string;
}

export type RateLimitName = keyof typeof RATE_LIMITS;

export interface LengthRange {
  min: number;
  max: number;
}
