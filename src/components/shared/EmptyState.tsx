import { Card } from "@/components/ui/Card";
import type { ReactNode } from "react";

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <Card className="p-10 text-center text-sm text-muted-foreground">
      {children}
    </Card>
  );
}
