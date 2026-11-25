import type { AdminUser } from "@/types/api";
import type { BadgeTone } from "@/types/ui";
import type { ReactNode } from "react";

export interface ReinstateButtonProps {
  user: AdminUser;
}

export interface SuspendButtonProps {
  user: AdminUser;
}

export interface AccessControlProps {
  user: AdminUser;
}

export interface TimelineEvent {
  _id: string;
  summary: string;
  createdAt: number;
}

export interface EventsTableProps {
  heading: string;
  emptyText: string;
  events: TimelineEvent[];
  summaryClassName?: string;
}

export type Tone = "neutral" | "warning" | "critical";

export interface StatTileProps {
  label: string;
  value: number | undefined;
  hint: string;
  tone?: Tone;
}

export interface TrustedLenderToggleProps {
  user: AdminUser;
}

export interface ChartRow {
  label: string;
  value: number;
}

export interface ChartProps {
  rows: ChartRow[];
  valueLabel: string;
}

export interface ChartCardProps {
  title: string;
  description: string;
  rows: ChartRow[];
  children: ReactNode;
}

export interface AuditActionStyle {
  label: string;
  tone: BadgeTone;
}
