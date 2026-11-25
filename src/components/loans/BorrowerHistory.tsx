import { cn } from "@/lib/utils";
import type {
  BorrowerHistory as History,
  BorrowerHistoryProps,
  HistoryFact,
} from "@/types";

function historyFacts(history: History): HistoryFact[] {
  const facts = [
    { text: `${history.completedLoans} completed`, isWarning: false },
    { text: `${history.lateReturns} late`, isWarning: history.lateReturns > 0 },
    {
      text: `${history.reportedIssues} issues`,
      isWarning: history.reportedIssues > 0,
    },
  ];

  if (history.overdueNow > 0) {
    facts.push({ text: `${history.overdueNow} overdue now`, isWarning: true });
  }

  return facts;
}

export function BorrowerHistory({ history }: BorrowerHistoryProps) {
  const isFirstLoan = history.completedLoans === 0 && history.overdueNow === 0;

  return (
    <p className="text-xs">
      <span className="text-muted-foreground">History: </span>

      {isFirstLoan && (
        <span className="text-muted-foreground">First loan on LendLoop</span>
      )}

      {!isFirstLoan &&
        historyFacts(history).map((fact, index) => (
          <span
            key={fact.text}
            className={cn(
              fact.isWarning ? "font-medium text-rose-700" : "text-stone-600",
            )}
          >
            {index > 0 && " · "}
            {fact.text}
          </span>
        ))}
    </p>
  );
}
