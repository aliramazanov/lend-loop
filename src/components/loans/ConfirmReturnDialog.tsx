import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Label, Textarea } from "@/components/ui/Field";
import { withToast } from "@/lib/toast";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import type { ReturnCondition } from "@convex/shared/catalog";
import { LOAN_POLICY } from "@convex/shared/policy";
import { useMutation } from "convex/react";
import { useState } from "react";
import { ReturnConditionOptions } from "./ReturnConditionOptions";
import { DialogActions } from "@/components/shared/DialogActions";

interface ConfirmReturnDialogProps {
  loanId: Id<"loans">;
  toolName: string;
  borrowerName: string;
  forUnavailableOwner?: boolean;
}

export function ConfirmReturnDialog({
  loanId,
  toolName,
  borrowerName,
  forUnavailableOwner = false,
}: ConfirmReturnDialogProps) {
  const confirmAsOwner = useMutation(api.loans.confirmReturn);
  const confirmAsAdmin = useMutation(api.loans.confirmReturnAsAdmin);
  const confirmReturn = forUnavailableOwner ? confirmAsAdmin : confirmAsOwner;
  const [condition, setCondition] = useState<ReturnCondition>("as_expected");
  const [note, setNote] = useState("");
  const reportsIssue = condition !== "as_expected";
  const noteIsTooShort = note.trim().length < LOAN_POLICY.minIssueNoteLength;

  function reset(open: boolean) {
    if (open) return;

    setCondition("as_expected");
    setNote("");
  }

  function confirm() {
    const trimmedNote = note.trim();

    void withToast(
      confirmReturn({ loanId, condition, note: trimmedNote || undefined }),
      reportsIssue
        ? "Return confirmed and the issue reported."
        : "Return confirmed.",
    );
  }

  return (
    <Dialog onOpenChange={reset}>
      <DialogTrigger asChild>
        <Button variant="dark" size="sm">
          Confirm return
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm {toolName} is back</DialogTitle>
          <DialogDescription>
            How did it come back from {borrowerName}?{" "}
            {forUnavailableOwner
              ? "The owner's account is suspended or deleted, so you are confirming it for them. This is recorded in the audit log."
              : "Problems are shown to future lenders and to admins."}
          </DialogDescription>
        </DialogHeader>

        <ReturnConditionOptions value={condition} onChange={setCondition} />

        <div>
          <Label htmlFor="return-note">
            {reportsIssue ? "What happened? (required)" : "Note (optional)"}
          </Label>
          <Textarea
            id="return-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={LOAN_POLICY.maxNoteLength}
            rows={2}
          />
        </div>

        <DialogActions
          confirmLabel={
            reportsIssue ? "Report and close loan" : "Confirm return"
          }
          confirmVariant={reportsIssue ? "destructive" : "default"}
          disabled={reportsIssue && noteIsTooShort}
          onConfirm={confirm}
        />
      </DialogContent>
    </Dialog>
  );
}
