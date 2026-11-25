import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
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
