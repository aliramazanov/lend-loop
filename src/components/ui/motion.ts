import { cn } from "@/lib/utils";

export const fadeInOut = cn(
  "data-[state=open]:animate-in data-[state=open]:fade-in-0",
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
);

export const popInOut = cn(
  fadeInOut,
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
);
