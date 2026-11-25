import { Badge } from "@/components/ui/Badge";
import type { LoanView } from "@/lib/convexTypes";
import { loanStage } from "@/lib/loanStage";

export function LoanStatusBadge({ loan }: { loan: LoanView }) {
  const stage = loanStage(loan);

  return <Badge tone={stage.tone}>{stage.label}</Badge>;
}
