import { CHART_THEME, ChartFrame, ChartTooltip } from "@/components/ui/Chart";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import { CHARTS } from "@/lib/config";
import type { ChartProps } from "./ChartCard";

const LAYOUT = CHARTS.ranked;

const { barRadius, fontSize } = CHARTS;

export function RankedBarChart({ rows, valueLabel }: ChartProps) {
  const height = rows.length * LAYOUT.rowHeight + LAYOUT.verticalPadding;

  return (
    <ChartFrame style={{ height }}>
      <BarChart
        accessibilityLayer={false}
        data={rows}
        layout="vertical"
        margin={LAYOUT.margin}
      >
        <XAxis type="number" hide allowDecimals={false} />

        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={LAYOUT.labelWidth}
          tick={{ fill: CHART_THEME.tick, fontSize: fontSize }}
        />

        <ChartTooltip valueLabel={valueLabel} hideLabel />

        <Bar
          dataKey="value"
          fill={CHART_THEME.bar}
          radius={[0, barRadius, barRadius, 0]}
          maxBarSize={LAYOUT.maxBarSize}
        >
          <LabelList
            dataKey="value"
            position="right"
            className="fill-stone-700"
            fontSize={fontSize}
          />
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}
