import { formatDateTime } from "@/lib/dates";
import { reminderNote } from "@/lib/loanStage";
import { useId, useState } from "react";
import type { ActivityLogProps } from "@/types";

export function ActivityLog({ loan }: ActivityLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const listId = useId();

  const automationNote =
    reminderNote(loan.lastReminderAt) ?? loan.lastAutomationSummary;

  const hasEvents = loan.events.length > 0;

  if (!automationNote && !hasEvents) return null;

  return (
    <div className="pt-1 text-xs text-stone-600">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {automationNote && <span>{automationNote}</span>}

        {hasEvents && (
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls={listId}
            className="cursor-pointer text-stone-500 underline underline-offset-2 hover:text-foreground"
          >
            {isOpen ? "Hide history" : "Show history"}
          </button>
        )}
      </div>

      {isOpen && (
        <ol id={listId} className="mt-2 space-y-1">
          {loan.events.map((event) => (
            <li key={event._id} className="flex gap-3">
              <time
                dateTime={new Date(event.createdAt).toISOString()}
                className="shrink-0 text-stone-500 tabular-nums"
              >
                {formatDateTime(event.createdAt)}
              </time>
              <span>{event.summary}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
