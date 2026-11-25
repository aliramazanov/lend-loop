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
import { formatDate } from "@/lib/dates";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { AccessControl } from "./AccessControl";
import { TrustedLenderToggle } from "./TrustedLenderToggle";

const HEADINGS = [
  "Name",
  "Role",
  "Joined",
  "Trusted lender",
  "Access",
] as const;

export function NeighborsTable() {
  const users = useQuery(api.users.listUsersForAdmin) ?? [];

  return (
    <Table>
      <TableHeadings labels={HEADINGS} alignLastRight />

      <TableBody>
        {users.length === 0 && (
          <EmptyTableRow colSpan={HEADINGS.length} text="No neighbors yet." />
        )}

        {users.map((user) => (
          <TableRow key={user._id}>
            <TableCell className="font-medium">
              {user.name}
              {user.suspended && (
                <Badge
                  tone="danger"
                  className="ml-2"
                  title={user.suspendedReason ?? undefined}
                >
                  Suspended
                </Badge>
              )}
            </TableCell>

            <TableCell className="capitalize">{user.role}</TableCell>
            <TableCell>{formatDate(user.createdAt)}</TableCell>

            <TableCell>
              {user.suspended ? (
                <span className="text-xs text-muted-foreground">
                  Not while suspended
                </span>
              ) : (
                <TrustedLenderToggle user={user} />
              )}
            </TableCell>

            <TableCell className="text-right">
              <AccessControl user={user} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
