/*
 * RequestExtensionDialog: the borrower picks a new end date.
 * Only dates that keep the whole loan within its limit can be chosen.
 */

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Input, Label } from "@/components/ui/Field";
import { addDaysToIsoDate } from "@/lib/dates";
import { withToast } from "@/lib/toast";
import { api } from "@convex/_generated/api";
import { LOAN_POLICY } from "@convex/shared/policy";
import { useMutation } from "convex/react";
import { useState } from "react";
import { CALENDAR } from "@/lib/config";
import { DialogActions } from "@/components/shared/DialogActions";
import type { RequestExtensionDialogProps } from "@/types";

export function RequestExtensionDialog({ loan }: RequestExtensionDialogProps) {
  const requestExtension = useMutation(api.loans.requestExtension);
  const earliest = addDaysToIsoDate(loan.endDate, 1);
  const latest = addDaysToIsoDate(loan.startDate, CALENDAR.lastDayOffset);
  const [endDate, setEndDate] = useState(earliest);
  const canExtend = earliest <= latest;
  const isValidChoice = endDate >= earliest && endDate <= latest;

  function sendRequest() {
    void withToast(
      requestExtension({ loanId: loan._id, endDate }),
      "Extension requested.",
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={!canExtend}
          title={
            canExtend
              ? undefined
              : `This loan already uses the ${LOAN_POLICY.maxDays}-day maximum`
          }
        >
          Request more days
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Keep {loan.toolName} longer</DialogTitle>
          <DialogDescription>
            The owner approves or declines. Loans last up to{" "}
            {LOAN_POLICY.maxDays} days in total.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Label htmlFor="extension-end-date">New end date</Label>
          <Input
            id="extension-end-date"
            type="date"
            value={endDate}
            min={earliest}
            max={latest}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>

        <DialogActions
          confirmLabel="Send request"
          disabled={!isValidChoice}
          onConfirm={sendRequest}
        />
      </DialogContent>
    </Dialog>
  );
}
