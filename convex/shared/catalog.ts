export const CATEGORIES = [
  "power tools",
  "garden",
  "kitchen",
  "camping",
  "electronics",
  "sports",
  "other",
] as const;

export const CONDITIONS = ["like_new", "good", "fair"] as const;

export const LOAN_STATUSES = [
  "pending",
  "approved",
  "active",
  "declined",
  "returned",
  "cancelled",
  "expired",
] as const;

export const RETURN_CONDITIONS = ["as_expected", "damaged", "missing"] as const;

export const ROLES = ["user", "admin"] as const;

export const LOAN_PARTIES = ["lender", "borrower"] as const;

export type Category = (typeof CATEGORIES)[number];

export type Condition = (typeof CONDITIONS)[number];

export type LoanStatus = (typeof LOAN_STATUSES)[number];

export type ReturnCondition = (typeof RETURN_CONDITIONS)[number];

export type Role = (typeof ROLES)[number];

export type LoanParty = (typeof LOAN_PARTIES)[number];

export const RETURN_CONDITION_LABELS: Record<ReturnCondition, string> = {
  as_expected: "As expected",
  damaged: "Damaged",
  missing: "Not returned",
};

export const CONDITION_LABELS: Record<Condition, string> = {
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};
