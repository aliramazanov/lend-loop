import { CenteredMessage } from "@/components/shared/CenteredMessage";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@clerk/nextjs";

export function SuspendedNotice() {
  return (
    <CenteredMessage
      title="Your account is suspended"
      description="A LendLoop admin suspended this account, so you can't list or borrow tools. If you think this is a mistake, contact your neighborhood admin."
    >
      <SignOutButton>
        <Button variant="outline">Sign out</Button>
      </SignOutButton>
    </CenteredMessage>
  );
}
