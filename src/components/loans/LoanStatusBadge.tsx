import { Badge } from "@/components/ui/Badge";
import { loanStage } from "@/lib/loanStage";
import type { LoanStatusBadgeProps } from "@/types";

export function LoanStatusBadge({ loan }: LoanStatusBadgeProps) {
  const stage = loanStage(loan);

  return <Badge tone={stage.tone}>{stage.label}</Badge>;
}
