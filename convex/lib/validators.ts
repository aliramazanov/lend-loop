import { v } from "convex/values";
import {
  CATEGORIES,
  CONDITIONS,
  LOAN_PARTIES,
  LOAN_STATUSES,
  RETURN_CONDITIONS,
  ROLES,
} from "../shared/catalog";
import {
  AUDIT_ACTIONS,
  AUTOMATION_EVENTS,
  EMAIL_KINDS,
  LOAN_EVENTS,
} from "./events";

function literalUnion<const Value extends string>(values: readonly Value[]) {
  return v.union(...values.map((value) => v.literal(value)));
}

export const categoryValidator = literalUnion(CATEGORIES);

export const conditionValidator = literalUnion(CONDITIONS);

export const loanStatusValidator = literalUnion(LOAN_STATUSES);

export const returnConditionValidator = literalUnion(RETURN_CONDITIONS);

export const roleValidator = literalUnion(ROLES);

export const loanPartyValidator = literalUnion(LOAN_PARTIES);

export const loanEventValidator = literalUnion(LOAN_EVENTS);

export const automationEventValidator = literalUnion(AUTOMATION_EVENTS);

export const auditActionValidator = literalUnion(AUDIT_ACTIONS);

export const emailKindValidator = literalUnion(EMAIL_KINDS);

export const toolFieldsValidator = {
  name: v.string(),
  category: categoryValidator,
  condition: conditionValidator,
  shortDescription: v.string(),
  photoIds: v.optional(v.array(v.id("_storage"))),
};
