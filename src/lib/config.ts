import { LOAN_POLICY } from "@convex/shared/policy";

export const CALENDAR = {
  visibleMonths: 2,
  lastDayOffset: LOAN_POLICY.maxDays - 1,
} as const;

export const PHOTO_COMPRESSION = {
  maxDimensionPx: 1600,
  webpQuality: 0.82,
  outputType: "image/webp",
} as const;

export const BOARD = {
  skeletonCards: 8,
} as const;

export const AVATAR = {
  maxInitials: 2,
} as const;

export const CHARTS = {
  fontSize: 12,
  barRadius: 4,
  column: {
    margin: { top: 4, right: 4, left: -24, bottom: 0 },
    tickMargin: 6,
    minTickGap: 24,
    yAxisWidth: 40,
    maxBarSize: 20,
  },
  ranked: {
    rowHeight: 24,
    verticalPadding: 4,
    margin: { top: 0, right: 24, left: 0, bottom: 0 },
    labelWidth: 96,
    maxBarSize: 14,
  },
} as const;
