import { cn } from "@/lib/utils";
import type { PageTransitionProps } from "@/types";

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <div
      className={cn(
        "animate-in duration-300 fade-in slide-in-from-bottom-1",
        "motion-reduce:animate-none",
      )}
    >
      {children}
    </div>
  );
}
