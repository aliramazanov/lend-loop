import { EmailKind } from "../lib/events";

export interface EmailDetails {
  toolName: string;
  startDate: string;
  endDate: string;
}

export interface EmailMessage {
  subject: string;
  text: string;
}

type Compose = (details: EmailDetails) => EmailMessage;

const SIGN_OFF = "Open LendLoop to see the details.\n\nThe LendLoop team";

const MESSAGES: Record<EmailKind, Compose> = {
  loan_requested: ({ toolName, startDate, endDate }) => ({
    subject: `New request for ${toolName}`,
    text: `A neighbor would like to borrow ${toolName} from ${startDate} to ${endDate}. Approve or decline the request.`,
  }),

  loan_approved: ({ toolName, startDate }) => ({
    subject: `Your request for ${toolName} was approved`,
    text: `Good news: you can pick up ${toolName} on ${startDate}.`,
  }),

  loan_declined: ({ toolName }) => ({
    subject: `Your request for ${toolName} was declined`,
    text: `The owner can't lend ${toolName} for those dates. Other tools may be free.`,
  }),

  loan_withdrawn: ({ toolName }) => ({
    subject: `${toolName} is no longer listed`,
    text: `The owner removed ${toolName}, so your request was closed.`,
  }),

  loan_cancelled: ({ toolName }) => ({
    subject: `The loan of ${toolName} was cancelled`,
    text: `The loan of ${toolName} was cancelled before the handover.`,
  }),

  loan_handed_over: ({ toolName, endDate }) => ({
    subject: `${toolName} has been handed over`,
    text: `The handover of ${toolName} was confirmed. It is due back on ${endDate}. If it did not happen, say so in LendLoop.`,
  }),

  loan_handover_disputed: ({ toolName, startDate }) => ({
    subject: `The handover of ${toolName} was disputed`,
    text: `The other neighbor says the handover of ${toolName} did not happen. The loan is waiting for pickup again from ${startDate}.`,
  }),

  loan_return_claimed: ({ toolName }) => ({
    subject: `${toolName} is on its way back`,
    text: `The borrower says ${toolName} is back. Check it and confirm the return.`,
  }),

  loan_returned: ({ toolName }) => ({
    subject: `Thanks for returning ${toolName}`,
    text: `The owner confirmed that ${toolName} is back. Thanks for keeping the loop going.`,
  }),

  loan_expired: ({ toolName }) => ({
    subject: `Your loan of ${toolName} expired`,
    text: `The dates for ${toolName} passed without a handover, so the loan expired.`,
  }),

  loan_extension_requested: ({ toolName }) => ({
    subject: `More days requested for ${toolName}`,
    text: `The borrower would like to keep ${toolName} longer. Approve or decline the extension.`,
  }),

  loan_extension_approved: ({ toolName, endDate }) => ({
    subject: `You can keep ${toolName} until ${endDate}`,
    text: `The owner approved your extension. ${toolName} is now due on ${endDate}.`,
  }),

  loan_extension_declined: ({ toolName, endDate }) => ({
    subject: `Extension declined for ${toolName}`,
    text: `The owner needs ${toolName} back on ${endDate} as planned.`,
  }),

  overdue_reminder: ({ toolName, endDate }) => ({
    subject: `${toolName} is overdue`,
    text: `${toolName} was due back on ${endDate}. Please return it as soon as you can.`,
  }),

  due_soon_reminder: ({ toolName, endDate }) => ({
    subject: `${toolName} is due back tomorrow`,
    text: `A friendly reminder: ${toolName} is due back on ${endDate}.`,
  }),

  overdue_escalation: ({ toolName, endDate }) => ({
    subject: `Escalated: ${toolName} is still overdue`,
    text: `${toolName} was due back on ${endDate} and is still out after daily reminders. Check Admin > Loans.`,
  }),
};

export function composeEmail(
  kind: EmailKind,
  details: EmailDetails,
): EmailMessage {
  const { subject, text } = MESSAGES[kind](details);

  return { subject, text: `${text}\n\n${SIGN_OFF}` };
}
