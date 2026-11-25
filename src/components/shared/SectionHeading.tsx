import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export function SectionHeading({
  className,
  children,
  ...props
}: ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "text-sm font-semibold tracking-wider text-muted-foreground uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}
