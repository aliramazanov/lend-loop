import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export interface SetTrustedLenderArgs {
  userId: Id<"users">;
  trustedLender: boolean;
}

export interface SuspendArgs {
  userId: Id<"users">;
  reason: string;
}

export type UserQueryCtx = QueryCtx & { user: Doc<"users"> };

export type UserMutationCtx = MutationCtx & { user: Doc<"users"> };
