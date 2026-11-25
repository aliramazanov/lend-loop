import { CHART_THEME, ChartFrame, ChartTooltip } from "@/components/ui/Chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CHARTS } from "@/lib/config";
import type { ChartProps } from "@/types";

const LAYOUT = CHARTS.column;

const { barRadius, fontSize } = CHARTS;

export function ColumnChart({ rows, valueLabel }: ChartProps) {
  return (
    <ChartFrame className="h-44">
      <BarChart accessibilityLayer={false} data={rows} margin={LAYOUT.margin}>
        <CartesianGrid vertical={false} stroke={CHART_THEME.grid} />

        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={LAYOUT.tickMargin}
          interval="preserveStartEnd"
          minTickGap={LAYOUT.minTickGap}
          fontSize={fontSize}
        />

        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={LAYOUT.yAxisWidth}
          fontSize={fontSize}
        />

        <ChartTooltip valueLabel={valueLabel} />

        <Bar
          dataKey="value"
          fill={CHART_THEME.bar}
          radius={[barRadius, barRadius, 0, 0]}
          maxBarSize={LAYOUT.maxBarSize}
        />
      </BarChart>
    </ChartFrame>
  );
}
