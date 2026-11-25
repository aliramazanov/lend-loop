import type { AuditActionStyle } from "@/types";
import type { AuditAction } from "@convex/types";

export const AUDIT_ACTION_STYLES: Record<AuditAction, AuditActionStyle> = {
  listing_deleted_by_owner: { label: "Removed listing", tone: "neutral" },
  listing_removed_by_admin: { label: "Took down listing", tone: "danger" },
  listing_restored: { label: "Restored listing", tone: "success" },
  loan_issue_reported: { label: "Reported a problem", tone: "danger" },
  loan_closed_by_admin: { label: "Closed loan for owner", tone: "warning" },
  handover_disputed: { label: "Disputed handover", tone: "warning" },
  role_granted: { label: "Became admin", tone: "admin" },
  role_revoked: { label: "Lost admin", tone: "neutral" },
  trusted_lender_granted: { label: "Marked trusted", tone: "success" },
  trusted_lender_revoked: { label: "Unmarked trusted", tone: "neutral" },
  user_suspended: { label: "Suspended", tone: "danger" },
  user_reinstated: { label: "Reinstated", tone: "success" },
  account_deleted: { label: "Deleted account", tone: "quiet" },
};
