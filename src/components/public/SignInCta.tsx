import { Button } from "@/components/ui/Button";
import { SignInButton } from "@clerk/nextjs";
import type { ComponentProps } from "react";

type ButtonVariant = ComponentProps<typeof Button>["variant"];

export function SignInCta({
  variant = "default",
}: {
  variant?: ButtonVariant;
}) {
  return (
    <SignInButton mode="modal" withSignUp>
      <Button variant={variant}>Sign in to lend or borrow</Button>
    </SignInButton>
  );
}
