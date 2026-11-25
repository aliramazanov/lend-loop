import type { Doc } from "../_generated/dataModel";

export type AuditEntry = Omit<
  Doc<"auditEvents">,
  "_id" | "_creationTime" | "createdAt"
>;

export type AuditEvent = Doc<"auditEvents">;
