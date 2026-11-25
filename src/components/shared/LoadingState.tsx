import { cn } from "@/lib/utils";

interface LoadingStateProps {
  label: string;
  fullScreen?: boolean;
}

export function LoadingState({ label, fullScreen = false }: LoadingStateProps) {
  return (
    <p
      aria-live="polite"
      className={cn(
        "flex items-center justify-center text-sm text-muted-foreground",
        fullScreen ? "min-h-screen" : "py-8",
      )}
    >
      {label}
    </p>
  );
}
