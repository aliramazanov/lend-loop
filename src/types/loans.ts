import type { BorrowerHistory, ListedLoan, LoanView } from "@/types/api";
import type { BadgeTone } from "@/types/ui";
import type { Id } from "@convex/_generated/dataModel";
import type { ReturnCondition } from "@convex/types/catalog";

export interface ActivityLogProps {
  loan: LoanView;
}

export interface BorrowerActionsProps {
  loan: LoanView;
}

export interface HistoryFact {
  text: string;
  isWarning: boolean;
}

export interface BorrowerHistoryProps {
  history: BorrowerHistory;
}

export interface ConfirmReturnDialogProps {
  loanId: Id<"loans">;
  toolName: string;
  borrowerName: string;
  forUnavailableOwner?: boolean;
}

export interface HandoverCheckProps {
  loan: LoanView;
}

export interface LenderActionsProps {
  loan: LoanView;
}

export interface DecisionButtonsProps {
  subject: "Request" | "Extension";
  approveLabel: string;
  approve: () => Promise<unknown>;
  decline: () => Promise<unknown>;
}

export interface CancelLoanButtonProps {
  loanId: Id<"loans">;
  label: string;
}

export interface LoanCardProps {
  loan: ListedLoan;
  perspective: "borrower" | "lender";
}

export interface LoanListProps {
  title: string;
  emptyText: string;
  perspective: "borrower" | "lender";
  loans: ListedLoan[] | undefined;
}

export type Perspective = "borrower" | "lender";

export interface LoanNoticesProps {
  loan: ListedLoan;
  perspective: Perspective;
}

export interface LoanStatusBadgeProps {
  loan: LoanView;
}

export interface RequestExtensionDialogProps {
  loan: LoanView;
}

export interface ReturnConditionOptionsProps {
  value: ReturnCondition;
  onChange: (condition: ReturnCondition) => void;
}

export interface LoanStage {
  tone: BadgeTone;
  label: string;
}

export type StageInput = Pick<
  LoanView,
  "status" | "hasStarted" | "isOverdue" | "returnCondition"
>;
