import { Button } from "@/components/ui/Button";
import {
  daysInclusive,
  formatDay,
  pluralizeDays,
  toIsoDate,
} from "@/lib/dates";
import { errorMessage } from "@/lib/errors";
import { api } from "@convex/_generated/api";
import { LOAN_POLICY } from "@convex/shared/policy";
import { useMutation } from "convex/react";
import { useState } from "react";
import type { DateRange as PickedRange } from "react-day-picker";
import { toast } from "sonner";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import type { BorrowPanelProps } from "@/types";

function selectedDates(range: PickedRange | undefined) {
  const startDate = range?.from ? toIsoDate(range.from) : null;
  const endDate = range?.to ? toIsoDate(range.to) : startDate;

  return startDate && endDate ? { startDate, endDate } : null;
}

export function BorrowPanel({ tool }: BorrowPanelProps) {
  const requestBorrow = useMutation(api.loans.requestBorrow);
  const [range, setRange] = useState<PickedRange | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dates = selectedDates(range);
  const days = dates ? daysInclusive(dates.startDate, dates.endDate) : 0;

  function clearDates() {
    setRange(undefined);
    setError(null);
  }

  async function submitRequest() {
    if (!dates) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await requestBorrow({ toolId: tool._id, ...dates });
      setRange(undefined);
      toast.success("Request sent. Track it under My Requests.");
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <AvailabilityCalendar
        bookedRanges={tool.bookedRanges}
        selected={range}
        onSelect={setRange}
      />

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800"
        >
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center justify-center gap-3 text-sm">
        <p className="text-stone-600" aria-live="polite">
          {dates
            ? `${formatDay(dates.startDate)} to ${formatDay(dates.endDate)}, ${pluralizeDays(days)}`
            : `Free to borrow for up to ${LOAN_POLICY.maxDays} days.`}
        </p>

        {dates && (
          <Button variant="link" className="h-auto p-0" onClick={clearDates}>
            Clear dates
          </Button>
        )}
      </div>

      <Button
        size="lg"
        className="mt-3 w-full shadow-sm"
        disabled={!dates || isSubmitting}
        onClick={() => void submitRequest()}
      >
        {isSubmitting && "Sending..."}
        {!isSubmitting && dates && `Request ${pluralizeDays(days)}`}
        {!isSubmitting && !dates && "Select dates to request"}
      </Button>
    </>
  );
}
