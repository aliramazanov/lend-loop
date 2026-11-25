import { cn } from "@/lib/utils";
import { fadeInOut, popInOut } from "./motion";

export const overlayClasses = cn("fixed inset-0 z-50 bg-black/50", fadeInOut);

export const panelClasses = cn(
  "fixed top-1/2 left-1/2 z-50 grid w-full -translate-1/2 gap-4",
  "max-w-[calc(100%-2rem)] sm:max-w-lg",
  "rounded-lg border bg-card p-6 shadow-lg duration-200 outline-none",
  popInOut,
);

export const headerClasses = "flex flex-col gap-2 text-center sm:text-left";

export const footerClasses = cn(
  "flex flex-col-reverse gap-2",
  "sm:flex-row sm:justify-end",
);

export const titleClasses = "text-lg leading-none font-semibold";

export const descriptionClasses = "text-sm text-muted-foreground";
