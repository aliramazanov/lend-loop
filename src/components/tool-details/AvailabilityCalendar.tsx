/*
 * AvailabilityCalendar: two months of availability for a tool.
 * Past days and booked days are blocked, and once a start day is picked, days beyond
 * the loan limit are blocked too.
 */

import { Calendar } from "@/components/ui/Calendar";
import { fromIsoDate, todayUtc } from "@/lib/dates";
import { addDays, isSameDay } from "date-fns";
import type { DateRange as PickedRange } from "react-day-picker";
import { CALENDAR } from "@/lib/config";
import type { AvailabilityCalendarProps } from "@/types";

function beyondLoanLimit(selected?: PickedRange) {
  const { from, to } = selected ?? {};
  const isChoosingEnd = from && (!to || isSameDay(from, to));

  if (!isChoosingEnd) return [];

  return [{ after: addDays(from, CALENDAR.lastDayOffset) }];
}

export function AvailabilityCalendar({
  bookedRanges,
  selected,
  onSelect,
}: AvailabilityCalendarProps) {
  const pastDays = { before: todayUtc() };

  const booked = bookedRanges.map((range) => ({
    from: fromIsoDate(range.startDate),
    to: fromIsoDate(range.endDate),
  }));

  const sharedProps = {
    numberOfMonths: CALENDAR.visibleMonths,
    modifiers: { booked },
    modifiersClassNames: { booked: "booked-day" },
    className: "mx-auto",
  };

  if (!onSelect) {
    return <Calendar {...sharedProps} disabled={pastDays} />;
  }

  return (
    <Calendar
      {...sharedProps}
      mode="range"
      selected={selected}
      onSelect={onSelect}
      disabled={[pastDays, ...booked, ...beyondLoanLimit(selected)]}
      excludeDisabled
      max={CALENDAR.lastDayOffset}
    />
  );
}
