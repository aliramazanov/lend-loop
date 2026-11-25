import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { CLERK_API_URL } from "./lib/config";
import { clerkSecretKey } from "./lib/env";

export const setBanned = internalAction({
  args: { clerkId: v.string(), banned: v.boolean() },

  handler: async (_ctx, { clerkId, banned }) => {
    const secret = clerkSecretKey();

    if (!secret) {
      console.warn("clerk_ban_skipped reason=missing_secret");

      return;
    }

    const action = banned ? "ban" : "unban";
    const userUrl = `${CLERK_API_URL}/users/${encodeURIComponent(clerkId)}`;

    const response = await fetch(`${userUrl}/${action}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
    });

    if (!response.ok) {
      throw new Error(`Clerk ${action} failed with HTTP ${response.status}`);
    }
  },
});
