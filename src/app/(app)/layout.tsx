/*
 * The signed-in area. Clerk sends signed-out visitors to sign in before anything renders,
 * and the account gate then checks the neighbor's record.
 */

import { AccountGate } from "@/components/account/AccountGate";
import { AppHeader } from "@/components/layout/AppHeader";
import { auth } from "@clerk/nextjs/server";
import type { SignedInLayoutProps } from "@/types";

export default async function SignedInLayout({
  children,
}: SignedInLayoutProps) {
  await auth.protect();

  return (
    <AccountGate>
      <AppHeader />

      <main id="main" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </AccountGate>
  );
}
