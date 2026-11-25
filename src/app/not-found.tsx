import { SiteHeader } from "@/components/layout/SiteHeader";
import { CenteredMessage } from "@/components/shared/CenteredMessage";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        <CenteredMessage
          title="Page not found"
          description="This page doesn't exist. The tool you're looking for may have been removed."
        >
          <Button variant="link" asChild>
            <Link href={ROUTES.home}>Back to all tools</Link>
          </Button>
        </CenteredMessage>
      </main>
    </>
  );
}
