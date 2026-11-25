import type { Id } from "../_generated/dataModel";

export interface SetTrustedLenderArgs {
  userId: Id<"users">;
  trustedLender: boolean;
}

export interface SuspendArgs {
  userId: Id<"users">;
  reason: string;
}
