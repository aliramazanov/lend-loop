import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const controlClasses = cn(
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm",
  "placeholder:text-muted-foreground",
  "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

const labelClasses = "mb-1 block text-xs font-medium text-stone-700";

interface LabelProps extends ComponentProps<"label"> {
  htmlFor: string;
}

function Label({ htmlFor, className, ...props }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(labelClasses, className)}
      {...props}
    />
  );
}

function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(controlClasses, className)}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(controlClasses, className)}
      {...props}
    />
  );
}

function Hint({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("mt-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Hint, Input, Label, labelClasses, Textarea };
