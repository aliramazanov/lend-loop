"use client";

import { useCurrentUser } from "@/components/account/CurrentUserContext";
import { CenteredMessage } from "@/components/shared/CenteredMessage";
import { LoadingState } from "@/components/shared/LoadingState";
import { PhotoCarousel } from "@/components/tools/PhotoCarousel";
import { Button } from "@/components/ui/Button";
import { browseRoute } from "@/lib/routes";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";
import { AdminRemovePanel } from "./AdminRemovePanel";
import { Breadcrumbs } from "./Breadcrumbs";
import { OwnerCard } from "./OwnerCard";
import { ToolSummaryCard } from "./ToolSummaryCard";
import type { ToolDetailsProps } from "@/types";

export function ToolDetails({ toolId }: ToolDetailsProps) {
  const { role } = useCurrentUser();
  const tool = useQuery(api.tools.getDetails, { toolId });

  if (tool === undefined) return <LoadingState label="Loading tool..." />;

  if (tool === null) {
    return (
      <CenteredMessage title="This listing isn't available">
        <Button variant="link" asChild>
          <Link href={browseRoute()}>Back to all tools</Link>
        </Button>
      </CenteredMessage>
    );
  }

  const canAdminRemove = role === "admin" && !tool.isOwner && !tool.isArchived;

  return (
    <div>
      <Breadcrumbs category={tool.category} toolName={tool.name} />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <PhotoCarousel
            name={tool.name}
            category={tool.category}
            photoUrls={tool.photoUrls}
          />

          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="mb-2 font-semibold">
              About this tool
            </h2>

            <p className="whitespace-pre-line text-stone-700">
              {tool.shortDescription}
            </p>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <ToolSummaryCard tool={tool} />
          <OwnerCard tool={tool} />

          {canAdminRemove && (
            <AdminRemovePanel toolId={tool._id} toolName={tool.name} />
          )}
        </aside>
      </div>
    </div>
  );
}
