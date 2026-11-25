import { categoryLabel } from "@/lib/categories";
import { browseRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { CATEGORIES, type Category } from "@convex/shared/catalog";
import Link from "next/link";

interface FilterChipProps {
  href: string;
  isActive: boolean;
  label: string;
}

function FilterChip({ href, isActive, label }: FilterChipProps) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "py-1 text-sm underline-offset-[6px] transition-colors duration-150",
        isActive
          ? "font-medium text-foreground underline decoration-primary decoration-2"
          : "text-stone-600 hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export function CategoryFilter({ selected }: { selected?: Category }) {
  return (
    <nav
      aria-label="Filter by category"
      className="flex flex-wrap gap-x-4 gap-y-1"
    >
      <FilterChip href={browseRoute()} isActive={!selected} label="All" />

      {CATEGORIES.map((category) => (
        <FilterChip
          key={category}
          href={browseRoute(category)}
          isActive={selected === category}
          label={categoryLabel(category)}
        />
      ))}
    </nav>
  );
}
