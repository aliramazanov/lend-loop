import { SiteHeader } from "@/components/layout/SiteHeader";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { TAGLINE } from "@/lib/site";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { PublicToolList } from "./PublicToolList";
import { SignInCta } from "./SignInCta";

export async function PublicBoard() {
  const tools = await fetchQuery(api.tools.listPublicBoard);

  return (
    <>
      <SiteHeader>
        <SignInCta variant="dark" />
      </SiteHeader>

      <main id="main" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <section className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {TAGLINE}
          </h1>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            A neighborhood tool-lending board. Browse available tools below,
            then sign in to list your own tools or request a borrow.
          </p>

          <div className="mt-6">
            <SignInCta />
          </div>
        </section>

        <section aria-labelledby="available-heading">
          <div className="mb-4 flex items-center justify-between">
            <SectionHeading id="available-heading">
              Available tools nearby
            </SectionHeading>

            <span className="text-xs text-muted-foreground">
              Owner details hidden until sign-in
            </span>
          </div>

          <PublicToolList tools={tools} />
        </section>
      </main>
    </>
  );
}
