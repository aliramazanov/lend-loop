import { OverviewCharts } from "@/components/admin/OverviewCharts";
import { OverviewStats } from "@/components/admin/OverviewStats";

export default function AdminOverviewPage() {
  return (
    <div className="space-y-4">
      <h1 className="sr-only">Admin overview</h1>
      <OverviewStats />
      <OverviewCharts />
    </div>
  );
}
