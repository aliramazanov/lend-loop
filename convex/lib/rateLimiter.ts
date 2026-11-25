import {
  HOUR,
  RateLimiter,
  type RateLimitConfig,
} from "@convex-dev/rate-limiter";
import { ConvexError } from "convex/values";
import { components } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import type { RateLimitName } from "../types";

export const RATE_LIMITS = {
  borrowRequest: { kind: "fixed window", rate: 10, period: HOUR },
  listingWrite: { kind: "fixed window", rate: 30, period: HOUR },
  loanDecision: { kind: "fixed window", rate: 60, period: HOUR },
  adminAction: { kind: "fixed window", rate: 60, period: HOUR },
  photoUpload: { kind: "fixed window", rate: 30, period: HOUR },
} as const satisfies Record<string, RateLimitConfig>;

const rateLimiter = new RateLimiter(components.rateLimiter, RATE_LIMITS);

export async function enforceRateLimit(
  ctx: MutationCtx,
  name: RateLimitName,
  userId: Id<"users">,
) {
  const { ok } = await rateLimiter.limit(ctx, name, { key: userId });

  if (!ok) {
    console.warn(`rate_limited action=${name} user=${userId}`);

    throw new ConvexError("Too many requests. Please try again later.");
  }
}
