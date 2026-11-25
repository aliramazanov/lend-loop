import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";
import { UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AccountSummary } from "./AccountSummary";
import { MainNav } from "./MainNav";
import { SiteHeader } from "./SiteHeader";

export function AppHeader() {
  return (
    <SiteHeader navigation={<MainNav />}>
      <Button asChild>
        <Link href={ROUTES.newListing}>
          <Plus aria-hidden />
          List a Tool
        </Link>
      </Button>

      <div className="flex items-center gap-2.5 sm:ml-1 sm:border-l sm:pl-4">
        <AccountSummary />
        <UserButton />
      </div>
    </SiteHeader>
  );
}
