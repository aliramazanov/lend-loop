import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Brand } from "./Brand";

interface SiteHeaderProps {
  children?: ReactNode;
  navigation?: ReactNode;
}

export function SiteHeader({ children, navigation }: SiteHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div
        className={cn(
          "mx-auto flex max-w-7xl flex-wrap items-center justify-between",
          "gap-3 px-4 py-3.5 sm:px-6",
        )}
      >
        <Brand />

        <div className="flex items-center gap-3">{children}</div>
      </div>

      {navigation}
    </header>
  );
}
