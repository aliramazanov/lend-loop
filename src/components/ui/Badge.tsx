import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import type { BadgeProps } from "@/types";

export const badgeVariants = cva(
  "inline-flex shrink-0 items-center text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "text-stone-700",
        quiet: "text-stone-500",
        success: "text-emerald-700",
        info: "text-sky-700",
        warning: "text-amber-700",
        danger: "text-rose-700",
        admin: "text-indigo-700",
        count: [
          "min-w-5 justify-center rounded-full bg-primary px-1.5",
          "text-[11px] leading-5 text-primary-foreground",
        ],
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { Badge };
