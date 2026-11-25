"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";
import { CategoryFilter } from "./CategoryFilter";
import { ToolCard } from "./ToolCard";
import { toolGridClasses, ToolGridSkeleton } from "./ToolGridSkeleton";
import { ToolSearch } from "./ToolSearch";
import type { ToolBrowserProps } from "@/types";

export function ToolBrowser({ category }: ToolBrowserProps) {
  const tools = useQuery(api.tools.listBoard, { category });
  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();

  const visibleTools = tools?.filter((tool) =>
    tool.name.toLowerCase().includes(term),
  );

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold">Neighborhood Tools</h1>
          <ToolSearch value={search} onChange={setSearch} />
        </div>

        <CategoryFilter selected={category} />
      </div>

      {visibleTools === undefined && <ToolGridSkeleton />}

      {visibleTools?.length === 0 && (
        <EmptyState>
          {term
            ? `No tools match "${search.trim()}".`
            : "No tools match this category."}
        </EmptyState>
      )}

      {visibleTools && visibleTools.length > 0 && (
        <ul className={toolGridClasses}>
          {visibleTools.map((tool) => (
            <li key={tool._id}>
              <ToolCard tool={tool} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
