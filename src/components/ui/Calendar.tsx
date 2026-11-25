import { format } from "date-fns";
import type { ComponentProps } from "react";
import { DayPicker, type Modifiers } from "react-day-picker";
import "react-day-picker/style.css";
import "./calendar.css";

function labelDayButton(date: Date, modifiers: Modifiers): string {
  const parts = [format(date, "d MMMM yyyy, EEEE")];

  if (modifiers.today) parts.unshift("Today");

  if (modifiers.selected) parts.push("selected");

  return parts.join(", ");
}

export function Calendar(props: ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays
      navLayout="around"
      labels={{ labelDayButton }}
      {...props}
    />
  );
}
