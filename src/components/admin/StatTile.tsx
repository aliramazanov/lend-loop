import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

type Tone = "neutral" | "warning" | "critical";

interface StatTileProps {
  label: string;
  value: number | undefined;
  hint: string;
  tone?: Tone;
}

const ALERT_STYLES: Record<
  Exclude<Tone, "neutral">,
  { tile: string; icon: string }
> = {
  warning: { tile: "border-amber-200 bg-amber-50", icon: "text-amber-700" },
  critical: { tile: "border-rose-200 bg-rose-50", icon: "text-rose-700" },
};

export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
}: StatTileProps) {
  const alert =
    tone !== "neutral" && (value ?? 0) > 0 ? ALERT_STYLES[tone] : null;

  return (
    <div className={cn("rounded-xl border bg-card px-3 py-2.5", alert?.tile)}>
      <p className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
        {alert && (
          <AlertTriangle aria-hidden className={cn("size-3.5", alert.icon)} />
        )}
        {label}
      </p>

      <p className="mt-0.5 text-xl font-semibold tabular-nums">
        {value ?? "..."}
      </p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}
