import {
  differenceInCalendarDays,
  getUnixTime,
  isValid,
  parseISO,
} from "date-fns";
import { millisecondsInDay } from "date-fns/constants";
import type { DateRange } from "../types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function todayUtc(now = Date.now()): string {
  const [date] = new Date(now).toISOString().split("T");

  return date;
}

export function tomorrowUtc(now = Date.now()): string {
  return todayUtc(now + millisecondsInDay);
}

export function daysAgo(days: number, now = Date.now()): number {
  return now - days * millisecondsInDay;
}

export function isIsoDate(value: string): boolean {
  return ISO_DATE_PATTERN.test(value) && isValid(parseISO(value));
}

export function daysInclusive({ startDate, endDate }: DateRange): number {
  return differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;
}

export function daysBetween(earlier: string, later: string): number {
  return differenceInCalendarDays(parseISO(later), parseISO(earlier));
}

export function datesOverlap(first: DateRange, second: DateRange): boolean {
  return first.startDate <= second.endDate && second.startDate <= first.endDate;
}

export function unixSeconds(now = Date.now()): number {
  return getUnixTime(now);
}
