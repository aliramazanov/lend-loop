import { Card } from "@/components/ui/Card";
import type { EmptyStateProps } from "@/types";

export function EmptyState({ children }: EmptyStateProps) {
  return (
    <Card className="p-10 text-center text-sm text-muted-foreground">
      {children}
    </Card>
  );
}
