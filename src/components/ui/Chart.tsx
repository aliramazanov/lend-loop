import type { CSSProperties, ReactNode } from "react";
import {
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
} from "recharts";
import { cn } from "@/lib/utils";

export const CHART_THEME = {
  bar: "var(--color-primary)",
  grid: "var(--color-border)",
  cursor: "var(--color-muted)",
  tick: "var(--color-stone-600)",
} as const;

interface ChartFrameProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

interface TooltipCardProps extends TooltipContentProps {
  valueLabel: string;
  hideLabel: boolean;
}

export function ChartFrame({ className, style, children }: ChartFrameProps) {
  return (
    <div className={cn("w-full text-xs", className)} style={style}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function TooltipCard({
  active,
  payload,
  label,
  valueLabel,
  hideLabel,
}: TooltipCardProps) {
  const [entry] = payload ?? [];

  if (!active || !entry) return null;

  return (
    <div className="rounded-lg border bg-card px-2.5 py-1.5 text-xs shadow-md">
      {!hideLabel && <p className="mb-1 font-medium">{label}</p>}

      <p className="flex items-center gap-2">
        <span aria-hidden className="size-2.5 rounded-xs bg-primary" />
        <span className="text-muted-foreground">{valueLabel}</span>
        <span className="ml-auto font-mono font-medium tabular-nums">
          {entry.value}
        </span>
      </p>
    </div>
  );
}

export function ChartTooltip({
  valueLabel,
  hideLabel = false,
}: {
  valueLabel: string;
  hideLabel?: boolean;
}) {
  return (
    <Tooltip
      cursor={{ fill: CHART_THEME.cursor }}
      content={(props: TooltipContentProps) => (
        <TooltipCard {...props} valueLabel={valueLabel} hideLabel={hideLabel} />
      )}
    />
  );
}
