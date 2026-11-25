import type {
  CATEGORIES,
  CONDITIONS,
  LOAN_PARTIES,
  LOAN_STATUSES,
  RETURN_CONDITIONS,
  ROLES,
} from "../shared/catalog";

export type Category = (typeof CATEGORIES)[number];

export type Condition = (typeof CONDITIONS)[number];

export type LoanStatus = (typeof LOAN_STATUSES)[number];

export type ReturnCondition = (typeof RETURN_CONDITIONS)[number];

export type Role = (typeof ROLES)[number];

export type LoanParty = (typeof LOAN_PARTIES)[number];
