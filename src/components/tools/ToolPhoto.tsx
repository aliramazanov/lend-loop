import { cn } from "@/lib/utils";
import type { Category } from "@convex/shared/catalog";
import {
  CookingPot,
  Drill,
  Dumbbell,
  Package,
  Sprout,
  Tent,
  Tv,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  "power tools": Drill,
  garden: Sprout,
  kitchen: CookingPot,
  camping: Tent,
  electronics: Tv,
  sports: Dumbbell,
  other: Package,
};

interface ToolPhotoProps {
  name: string;
  category: Category;
  photoUrl: string | null;
  className?: string;
}

export function ToolPhoto({
  name,
  category,
  photoUrl,
  className,
}: ToolPhotoProps) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        loading="lazy"
        className={cn(
          "object-cover transition-transform duration-300 ease-out",
          "group-hover:scale-[1.03]",
          "motion-reduce:transition-none motion-reduce:group-hover:scale-100",
          className,
        )}
      />
    );
  }

  const Icon = CATEGORY_ICONS[category];

  return (
    <div
      className={cn(
        "flex items-center justify-center text-emerald-900/35",
        "bg-gradient-to-br from-emerald-50 via-stone-50 to-stone-100",
        className,
      )}
    >
      <Icon
        aria-hidden
        strokeWidth={1.5}
        className="size-1/5 max-h-20 min-h-6 max-w-20 min-w-6"
      />
    </div>
  );
}
