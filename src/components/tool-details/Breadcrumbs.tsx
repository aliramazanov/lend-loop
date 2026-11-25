import { categoryLabel } from "@/lib/categories";
import { browseRoute } from "@/lib/routes";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { BreadcrumbsProps } from "@/types";

const crumbClasses = "font-medium text-primary-hover hover:underline";

export function Breadcrumbs({ category, toolName }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href={browseRoute()} className={crumbClasses}>
            All tools
          </Link>
        </li>

        <ChevronRight aria-hidden className="size-3.5" />

        <li>
          <Link href={browseRoute(category)} className={crumbClasses}>
            {categoryLabel(category)}
          </Link>
        </li>

        <ChevronRight aria-hidden className="size-3.5" />

        <li aria-current="page" className="text-stone-700">
          {toolName}
        </li>
      </ol>
    </nav>
  );
}
