import type { Doc, Id } from "../_generated/dataModel";
import type { LoanStatus, ReturnCondition } from "./catalog";
import type { LoanEvent } from "./events";
import type { DateRange } from "./lib";

export type LoanRole = "lender" | "borrower";

export interface LoanAccess {
  user: Doc<"users">;
  loan: Doc<"loans">;
}

export interface RequireLoanRoleArgs {
  role: LoanRole;
  deniedReason: string;
}

export interface ExtensionRequest {
  loanId: Id<"loans">;
  endDate: string;
}

export interface ExtensionAnswer {
  loanId: Id<"loans">;
  approve: boolean;
}

export type BorrowRequest = DateRange & { toolId: Id<"tools"> };

export interface ReturnReport {
  loanId: Id<"loans">;
  condition: ReturnCondition;
  note?: string;
}

export interface AuditReportedIssueArgs {
  condition: ReturnCondition;
  note: string;
}

export type Loan = Doc<"loans">;

export interface AssertDatesAreFreeArgs {
  toolId: Id<"tools">;
  range: DateRange;
  ignoredLoanId?: Id<"loans">;
}

export interface AssertNoDuplicateRequestArgs {
  toolId: Id<"tools">;
  range: DateRange;
  borrowerId: Id<"users">;
}

export interface LoanNotice {
  loan: Doc<"loans">;
  event: LoanEvent;
  recipientId: Id<"users">;
}

export interface LoanTransition {
  status: LoanStatus;
  event: LoanEvent;
  recipientId: Id<"users">;
  fields?: Partial<Doc<"loans">>;
}
