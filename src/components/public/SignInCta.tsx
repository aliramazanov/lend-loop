import { Button } from "@/components/ui/Button";
import { SignInButton } from "@clerk/nextjs";
import type { SignInCtaProps } from "@/types";

export function SignInCta({ variant = "default" }: SignInCtaProps) {
  return (
    <SignInButton mode="modal" withSignUp>
      <Button variant={variant}>Sign in to lend or borrow</Button>
    </SignInButton>
  );
}
