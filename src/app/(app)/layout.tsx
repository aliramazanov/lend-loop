import { AccountGate } from "@/components/account/AccountGate";
import { AppHeader } from "@/components/layout/AppHeader";
import { auth } from "@clerk/nextjs/server";
import type { ReactNode } from "react";

export default async function SignedInLayout({
  children,
}: {
  children: ReactNode;
}) {
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
