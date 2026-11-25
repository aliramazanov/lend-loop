import type { AlertDialogAction } from "@/components/ui/AlertDialog";
import type { badgeVariants } from "@/components/ui/Badge";
import type { Button, buttonVariants } from "@/components/ui/Button";
import type { VariantProps } from "class-variance-authority";
import type useEmblaCarousel from "embla-carousel-react";
import type { CSSProperties, ComponentProps, ReactNode } from "react";
import type { TooltipContentProps } from "recharts";

export interface ActionButtonProps extends Omit<
  ComponentProps<typeof Button>,
  "onClick" | "asChild"
> {
  action: () => Promise<unknown>;
  successMessage: string;
  onSuccess?: () => void;
}

export interface CenteredMessageProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  confirmVariant?: ComponentProps<typeof AlertDialogAction>["variant"];
  confirmDisabled?: boolean;
  action: () => Promise<unknown>;
  successMessage: string;
  onSuccess?: () => void;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export interface DialogActionsProps {
  confirmLabel: string;
  confirmVariant?: ComponentProps<typeof Button>["variant"];
  disabled?: boolean;
  onConfirm: () => void;
}

export interface EmptyStateProps {
  children: ReactNode;
}

export interface LoadingStateProps {
  label: string;
  fullScreen?: boolean;
}

export interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

export type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

export type BadgeTone = NonNullable<BadgeProps["tone"]>;

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export type EmblaApi = NonNullable<ReturnType<typeof useEmblaCarousel>[1]>;

export interface CarouselState {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  selectedIndex: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollTo: (index: number) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
}

export interface CarouselArrowProps {
  direction: "previous" | "next";
  className?: string;
}

export interface ChartFrameProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface TooltipCardProps extends TooltipContentProps {
  valueLabel: string;
  hideLabel: boolean;
}

export interface ChartTooltipProps {
  valueLabel: string;
  hideLabel?: boolean;
}

export interface LabelProps extends ComponentProps<"label"> {
  htmlFor: string;
}

export interface TableHeadingsProps {
  labels: readonly string[];
  alignLastRight?: boolean;
}

export interface EmptyTableRowProps {
  colSpan: number;
  text: string;
}
