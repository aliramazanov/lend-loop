import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-xl border bg-card p-4 text-card-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, children, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)} {...props} />
  );
}

export { Card, CardDescription, CardTitle };
