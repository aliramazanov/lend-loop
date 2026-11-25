import type { ReactNode } from "react";

export interface ChartRow {
  label: string;
  value: number;
}

export interface ChartProps {
  rows: ChartRow[];
  valueLabel: string;
}

interface ChartCardProps {
  title: string;
  description: string;
  rows: ChartRow[];
  children: ReactNode;
}

export function ChartCard({
  title,
  description,
  rows,
  children,
}: ChartCardProps) {
  return (
    <figure className="rounded-2xl border bg-card p-4">
      <figcaption className="mb-2">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </figcaption>

      <div aria-hidden>{children}</div>

      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
