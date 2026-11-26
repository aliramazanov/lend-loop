/*
 * Date helpers for the interface.
 * Today is the UTC date, matching the server, so the calendar and the booking rules agree.
 */

import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";

const ISO_DATE = "yyyy-MM-dd";

export function todayUtc(): Date {
  const [utcDate] = new Date().toISOString().split("T");

  return parseISO(utcDate);
}

export function toIsoDate(date: Date): string {
  return format(date, ISO_DATE);
}

export function fromIsoDate(isoDate: string): Date {
  return parseISO(isoDate);
}

export function addDaysToIsoDate(isoDate: string, days: number): string {
  return toIsoDate(addDays(parseISO(isoDate), days));
}

export function daysInclusive(startDate: string, endDate: string): number {
  return differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;
}

export function daysSince(timestamp: number): number {
  return differenceInCalendarDays(Date.now(), timestamp);
}

export function formatDay(isoDate: string): string {
  return format(parseISO(isoDate), "MMM d");
}

export function formatDate(timestamp: number): string {
  return format(timestamp, "MMM d, yyyy");
}

export function formatMonthYear(timestamp: number): string {
  return format(timestamp, "MMM yyyy");
}

export function formatDateTime(timestamp: number): string {
  return format(timestamp, "MMM d, yyyy HH:mm");
}

export function pluralizeDays(days: number): string {
  return `${days} ${days === 1 ? "day" : "days"}`;
}
