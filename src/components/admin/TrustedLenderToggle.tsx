import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import type { AdminUser } from "@/lib/convexTypes";
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";

export function TrustedLenderToggle({ user }: { user: AdminUser }) {
  const setTrustedLender = useMutation(api.users.setTrustedLender);
  const isTrusted = user.trustedLender;

  return (
    <ConfirmDialog
      trigger={
        <Button
          size="sm"
          variant={isTrusted ? "default" : "outline"}
          aria-pressed={isTrusted}
        >
          {isTrusted ? "Trusted" : "Mark trusted"}
          <span className="sr-only"> {user.name}</span>
        </Button>
      }
      title={
        isTrusted
          ? `Remove trusted lender status from ${user.name}?`
          : `Mark ${user.name} as a trusted lender?`
      }
      description={
        isTrusted
          ? "The badge disappears from their listings and profile. The change is recorded in the audit log."
          : "Every neighbor will see a verified badge on their listings and profile. The change is recorded in the audit log."
      }
      confirmLabel={isTrusted ? "Remove badge" : "Mark as trusted"}
      confirmVariant={isTrusted ? "destructive" : "default"}
      action={() =>
        setTrustedLender({ userId: user._id, trustedLender: !isTrusted })
      }
      successMessage={
        isTrusted
          ? "Trusted lender status removed."
          : "Marked as a trusted lender."
      }
    />
  );
}
