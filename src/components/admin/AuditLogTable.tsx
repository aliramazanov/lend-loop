"use client";

import { Badge } from "@/components/ui/Badge";
import {
  EmptyTableRow,
  Table,
  TableBody,
  TableCell,
  TableHeadings,
  TableRow,
} from "@/components/ui/Table";
import { AUDIT_ACTION_STYLES } from "@/lib/auditActions";
import { formatDateTime } from "@/lib/dates";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";

const HEADINGS = ["When", "Who", "Action", "About", "Details"] as const;

export function AuditLogTable() {
  const auditLog = useQuery(api.users.listAuditLogForAdmin) ?? [];

  return (
    <Table>
      <TableHeadings labels={HEADINGS} />

      <TableBody>
        {auditLog.length === 0 && (
          <EmptyTableRow
            colSpan={HEADINGS.length}
            text="No admin or listing actions recorded yet."
          />
        )}

        {auditLog.map((event) => {
          const { label, tone } = AUDIT_ACTION_STYLES[event.action];

          return (
            <TableRow key={event._id}>
              <TableCell className="text-muted-foreground tabular-nums">
                {formatDateTime(event.createdAt)}
              </TableCell>

              <TableCell className="font-medium">{event.actorName}</TableCell>

              <TableCell>
                <Badge tone={tone} className="text-sm">
                  {label}
                </Badge>
              </TableCell>

              <TableCell className="max-w-64 truncate">
                {event.targetName}
              </TableCell>

              <TableCell className="min-w-56 whitespace-normal text-muted-foreground">
                {event.detail}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
