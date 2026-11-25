import { cn } from "@/lib/utils";
import {
  RETURN_CONDITION_LABELS,
  RETURN_CONDITIONS,
} from "@convex/shared/catalog";
import type { ReturnCondition } from "@convex/types";
import type { ReturnConditionOptionsProps } from "@/types";

const HINTS: Record<ReturnCondition, string> = {
  as_expected: "Same condition as when it left",
  damaged: "Broken, worn out or missing parts",
  missing:
    "The tool never came back. Its listing comes off the board until you restore it.",
};

const OPTIONS = RETURN_CONDITIONS.map((value) => ({
  value,
  label: RETURN_CONDITION_LABELS[value],
  hint: HINTS[value],
}));

export function ReturnConditionOptions({
  value,
  onChange,
}: ReturnConditionOptionsProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="sr-only">Condition on return</legend>

      {OPTIONS.map((option) => (
        <label
          key={option.value}
          className={cn(
            "grid cursor-pointer grid-cols-[auto_1fr] gap-x-3 rounded-lg border",
            "px-3 py-2 text-sm",
            value === option.value
              ? "border-primary bg-emerald-50/60"
              : "hover:bg-muted",
          )}
        >
          <input
            type="radio"
            name="return-condition"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="row-span-2 mt-1 accent-primary"
          />
          {option.label}
          <span className="col-start-2 text-xs text-muted-foreground">
            {option.hint}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
