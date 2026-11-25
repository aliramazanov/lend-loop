import { Card } from "@/components/ui/Card";
import type { ToolDetailsView } from "@/lib/convexTypes";
import { formatMonthYear } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { AVATAR } from "@/lib/config";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, AVATAR.maxInitials)
    .toUpperCase();
}

function OwnerStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-stone-50 px-2 py-2.5">
      <dd className="text-sm font-semibold whitespace-nowrap">{value}</dd>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
    </div>
  );
}

export function OwnerCard({ tool }: { tool: ToolDetailsView }) {
  const ownerLabel = tool.isOwner ? `${tool.ownerName} (you)` : tool.ownerName;

  return (
    <Card aria-label="Owner" className="rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-full",
            "bg-emerald-100 text-sm font-semibold text-emerald-800",
          )}
        >
          {initialsOf(tool.ownerName)}
        </span>

        <div>
          <p className="font-medium">{ownerLabel}</p>

          {tool.ownerTrustedLender ? (
            <p className="text-xs font-medium text-emerald-800">
              Trusted lender, verified by an admin
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Neighbor</p>
          )}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <OwnerStat
          label="Member since"
          value={formatMonthYear(tool.ownerSince)}
        />
        <OwnerStat
          label="Tools listed"
          value={String(tool.ownerActiveListings)}
        />
        <OwnerStat
          label="Loans completed"
          value={String(tool.ownerCompletedLoans)}
        />
      </dl>
    </Card>
  );
}
