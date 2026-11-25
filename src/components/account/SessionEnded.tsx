import { CenteredMessage } from "@/components/shared/CenteredMessage";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";
import { SignOutButton } from "@clerk/nextjs";

export function SessionEnded() {
  return (
    <CenteredMessage
      title="Your session has ended"
      description="You were signed out, for example because an admin changed your account. Sign in again to keep using LendLoop."
    >
      <SignOutButton redirectUrl={ROUTES.home}>
        <Button>Back to sign in</Button>
      </SignOutButton>
    </CenteredMessage>
  );
}
