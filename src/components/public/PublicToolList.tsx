import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/Card";
import { categoryLabel } from "@/lib/categories";
import type { api } from "@convex/_generated/api";
import type { FunctionReturnType } from "convex/server";

type PublicTools = FunctionReturnType<typeof api.tools.listPublicBoard>;

export function PublicToolList({ tools }: { tools: PublicTools }) {
  if (tools.length === 0) {
    return (
      <EmptyState>
        No tools listed yet. Sign in to add the first neighborhood tool!
      </EmptyState>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <li key={tool._id}>
          <Card className="flex items-center justify-between px-4 py-3.5">
            <span className="font-medium">{tool.name}</span>
            <span className="text-sm text-muted-foreground">
              {categoryLabel(tool.category)}
            </span>
          </Card>
        </li>
      ))}
    </ul>
  );
}
