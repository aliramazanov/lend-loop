import { cn } from "@/lib/utils";
import type { CenteredMessageProps } from "@/types";

export function CenteredMessage({
  title,
  description,
  children,
}: CenteredMessageProps) {
  return (
    <section
      className={cn(
        "mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center",
        "gap-2 px-4 text-center",
      )}
    >
      <h1 className="text-xl font-semibold">{title}</h1>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}
