"use client";

/*
 * LoansTable: every loan for admins, with status, dates and the latest automation result.
 * When an owner is suspended or deleted mid-loan, a button lets the admin confirm the
 * return for them. Escalated loans are marked.
 */

import { ConfirmReturnDialog } from "@/components/loans/ConfirmReturnDialog";
import { LoanStatusBadge } from "@/components/loans/LoanStatusBadge";
import { Badge } from "@/components/ui/Badge";
import {
  EmptyTableRow,
  Table,
  TableBody,
  TableCell,
  TableHeadings,
  TableRow,
} from "@/components/ui/Table";
import { formatDay } from "@/lib/dates";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";

const HEADINGS = [
  "Tool",
  "Lender",
  "Borrower",
  "Dates",
  "Status",
  "Last automation",
  "Action",
] as const;

export function LoansTable() {
  const loans = useQuery(api.loans.listAllForAdmin) ?? [];

  return (
    <Table>
      <TableHeadings labels={HEADINGS} alignLastRight />

      <TableBody>
        {loans.length === 0 && (
          <EmptyTableRow colSpan={HEADINGS.length} text="No loans yet." />
        )}

        {loans.map((loan) => (
          <TableRow key={loan._id}>
            <TableCell className="font-medium">{loan.toolName}</TableCell>
            <TableCell>
              {loan.lenderName}
              {loan.lenderUnavailable && (
                <Badge tone="danger" className="ml-2">
                  Owner unavailable
                </Badge>
              )}
            </TableCell>
            <TableCell>{loan.borrowerName}</TableCell>

            <TableCell>
              {formatDay(loan.startDate)} to {formatDay(loan.endDate)}
            </TableCell>

            <TableCell>
              <LoanStatusBadge loan={loan} />
              {loan.isEscalated && (
                <Badge tone="danger" className="ml-2">
                  Escalated
                </Badge>
              )}
            </TableCell>

            <TableCell className="max-w-72 truncate text-muted-foreground">
              {loan.returnNote ?? loan.lastAutomationSummary ?? "None yet"}
            </TableCell>

            <TableCell className="text-right">
              {loan.status === "active" && loan.lenderUnavailable && (
                <ConfirmReturnDialog
                  loanId={loan._id}
                  toolName={loan.toolName}
                  borrowerName={loan.borrowerName}
                  forUnavailableOwner
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
