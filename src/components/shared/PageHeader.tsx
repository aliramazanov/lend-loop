import type { PageHeaderProps } from "@/types";

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-lg font-semibold">{title}</h1>

      {children}
    </div>
  );
}
