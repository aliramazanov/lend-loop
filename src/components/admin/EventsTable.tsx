import {
  EmptyTableRow,
  Table,
  TableBody,
  TableCell,
  TableHeadings,
  TableRow,
} from "@/components/ui/Table";
import { formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { EventsTableProps } from "@/types";

export function EventsTable({
  heading,
  emptyText,
  events,
  summaryClassName,
}: EventsTableProps) {
  const headings = [heading, "When"];

  return (
    <Table>
      <TableHeadings labels={headings} alignLastRight />

      <TableBody>
        {events.length === 0 && (
          <EmptyTableRow colSpan={headings.length} text={emptyText} />
        )}

        {events.map((event) => (
          <TableRow key={event._id}>
            <TableCell className={cn("whitespace-normal", summaryClassName)}>
              {event.summary}
            </TableCell>

            <TableCell className="text-right text-muted-foreground">
              {formatDateTime(event.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
