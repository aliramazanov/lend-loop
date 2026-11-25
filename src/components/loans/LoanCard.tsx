import { Card } from "@/components/ui/Card";
import type { ListedLoan } from "@/lib/convexTypes";
import { formatDay } from "@/lib/dates";
import { toolRoute } from "@/lib/routes";
import Link from "next/link";
import { ActivityLog } from "./ActivityLog";
import { BorrowerActions } from "./BorrowerActions";
import { LenderActions } from "./LenderActions";
import { LoanNotices } from "./LoanNotices";
import { LoanStatusBadge } from "./LoanStatusBadge";

interface LoanCardProps {
  loan: ListedLoan;
  perspective: "borrower" | "lender";
}

export function LoanCard({ loan, perspective }: LoanCardProps) {
  const isLender = perspective === "lender";

  const counterpart = isLender
    ? `Borrower: ${loan.borrowerName}`
    : `Lender: ${loan.lenderName}`;

  return (
    <Card className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2.5">
          <Link
            href={toolRoute(loan.toolId)}
            className="font-medium hover:underline"
          >
            {loan.toolName}
          </Link>
          <LoanStatusBadge loan={loan} />
        </div>

        <p className="text-xs text-muted-foreground">
          {counterpart} · {formatDay(loan.startDate)} to{" "}
          {formatDay(loan.endDate)}
        </p>

        <LoanNotices loan={loan} perspective={perspective} />
        <ActivityLog loan={loan} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isLender ? (
          <LenderActions loan={loan} />
        ) : (
          <BorrowerActions loan={loan} />
        )}
      </div>
    </Card>
  );
}
