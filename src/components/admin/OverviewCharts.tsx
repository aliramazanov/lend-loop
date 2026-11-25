"use client";

import { categoryLabel } from "@/lib/categories";
import type { AdminOverview } from "@/lib/convexTypes";
import { formatDay } from "@/lib/dates";
import { statusLabel } from "@/lib/loanStage";
import { api } from "@convex/_generated/api";
import { CATEGORIES, LOAN_STATUSES } from "@convex/shared/catalog";
import { OVERVIEW_WINDOWS } from "@convex/shared/policy";
import { useQuery } from "convex/react";
import { ChartCard, type ChartRow } from "./charts/ChartCard";
import { ColumnChart } from "./charts/ColumnChart";
import { RankedBarChart } from "./charts/RankedBarChart";

function requestRows(overview?: AdminOverview): ChartRow[] {
  return (overview?.requestsPerDay ?? []).map((day) => ({
    label: formatDay(day.date),
    value: day.requests,
  }));
}

function statusRows(overview?: AdminOverview): ChartRow[] {
  return LOAN_STATUSES.map((status) => ({
    label: statusLabel(status),
    value: overview?.loansByStatus[status] ?? 0,
  }));
}

function categoryRows(overview?: AdminOverview): ChartRow[] {
  const rows = CATEGORIES.map((category) => ({
    label: categoryLabel(category),
    value: overview?.listingsByCategory[category] ?? 0,
  }));

  return rows.sort((first, second) => second.value - first.value);
}

export function OverviewCharts() {
  const overview = useQuery(api.admin.overview);
  const requests = requestRows(overview);
  const statuses = statusRows(overview);
  const categories = categoryRows(overview);

  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      <ChartCard
        title="Borrow requests"
        description={`Per day, last ${OVERVIEW_WINDOWS.trendDays} days`}
        rows={requests}
      >
        <ColumnChart rows={requests} valueLabel="Requests" />
      </ChartCard>

      <ChartCard title="Loans by status" description="All time" rows={statuses}>
        <RankedBarChart rows={statuses} valueLabel="Loans" />
      </ChartCard>

      <ChartCard
        title="Active listings"
        description="By category"
        rows={categories}
      >
        <RankedBarChart rows={categories} valueLabel="Listings" />
      </ChartCard>
    </div>
  );
}
