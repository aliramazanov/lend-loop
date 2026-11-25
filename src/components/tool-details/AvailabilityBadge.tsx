import { Badge, type BadgeTone } from "@/components/ui/Badge";

interface Availability {
  tone: BadgeTone;
  label: string;
}

function availabilityOf(
  isArchived: boolean,
  isAvailable: boolean,
): Availability {
  if (isArchived) return { tone: "quiet", label: "Removed" };

  return isAvailable
    ? { tone: "success", label: "Available now" }
    : { tone: "warning", label: "On loan" };
}

export function AvailabilityBadge({
  isArchived,
  isAvailable,
}: {
  isArchived: boolean;
  isAvailable: boolean;
}) {
  const { tone, label } = availabilityOf(isArchived, isAvailable);

  return (
    <Badge tone={tone} className="pt-2 text-sm">
      {label}
    </Badge>
  );
}
