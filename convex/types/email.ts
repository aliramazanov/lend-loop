import type { Doc, Id } from "../_generated/dataModel";
import type { loanEmailPayload } from "../model/emailDelivery";
import type { EmailKind } from "./events";
import type { Infer } from "convex/values";

export type LoanEmail = Infer<typeof loanEmailPayload>;

export interface EmailDetails {
  toolName: string;
  startDate: string;
  endDate: string;
}

export interface EmailMessage {
  subject: string;
  text: string;
}

export type Compose = (details: EmailDetails) => EmailMessage;

export interface ScheduleLoanEmailArgs {
  emailId: string;
  kind: EmailKind;
  loan: Doc<"loans">;
  recipientId: Id<"users">;
}
