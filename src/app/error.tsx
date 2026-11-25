"use client";

import { CenteredMessage } from "@/components/shared/CenteredMessage";
import { Button } from "@/components/ui/Button";
import type { ErrorPageProps } from "@/types";

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main id="main">
      <CenteredMessage
        title="Something went wrong"
        description="The page hit an unexpected error. Try again, and if it keeps happening, reload the page."
      >
        {error.digest && (
          <p className="mb-4 font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}

        <Button onClick={reset}>Try again</Button>
      </CenteredMessage>
    </main>
  );
}
