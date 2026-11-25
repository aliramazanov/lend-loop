import { cn } from "@/lib/utils";

export function SkipLink() {
  return (
    <a
      href="#main"
      className={cn(
        "sr-only",
        "focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50",
        "focus:rounded-lg focus:bg-card focus:px-4 focus:py-2",
        "focus:text-sm focus:font-medium",
      )}
    >
      Skip to main content
    </a>
  );
}
