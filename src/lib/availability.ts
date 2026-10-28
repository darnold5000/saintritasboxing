import { SITE } from "@/lib/site";
import {
  addDays,
  addMinutes,
  currentHourInTimezone,
  todayISO,
  weekdayIndex,
} from "@/lib/dates";

export type WeekdayHours = {
  enabled: boolean;
  start: string;
  end: string;
};

/**
 * Sample gym hours pending owner confirmation.
 * Sunday closed. Monday–Saturday 6:00 AM–8:00 PM in 60-minute slots.
 * Admin can override in the database when Supabase is configured.
 */
export const DEFAULT_WEEKLY_HOURS: Record<number, WeekdayHours> = {
  0: { enabled: false, start: "09:00", end: "12:00" },
  1: { enabled: true, start: "06:00", end: "20:00" },
  2: { enabled: true, start: "06:00", end: "20:00" },
  3: { enabled: true, start: "06:00", end: "20:00" },
  4: { enabled: true, start: "06:00", end: "20:00" },
  5: { enabled: true, start: "06:00", end: "20:00" },
  6: { enabled: true, start: "06:00", end: "20:00" },
};

export const AVAILABILITY_NOTICE =
  "These times are a working schedule for the demo. The owner still needs to confirm operating hours before launch — we are not publishing unverified gym hours on the public site.";

export type AvailabilityConfig = {
  weekly: Record<number, WeekdayHours>;
  blockedDates: string[];
  extraSlots: Array<{ date: string; time: string }>;
  durationMinutes: number;
  bookedSlots: Array<{ date: string; time: string }>;
};

export function slotTimesForHours(
  hours: WeekdayHours,
  durationMinutes: number,
): string[] {
  if (!hours.enabled) return [];
  const times: string[] = [];
  let cursor = hours.start;
  while (addMinutes(cursor, durationMinutes) <= hours.end) {
    times.push(cursor);
    cursor = addMinutes(cursor, durationMinutes);
    if (times.length > 48) break;
  }
  return times;
}

export function isSlotInPast(date: string, time: string, now = new Date()) {
  const today = todayISO(now);
  if (date < today) return true;
  if (date > today) return false;
  const hour = Number(time.slice(0, 2));
  return hour <= currentHourInTimezone(now);
}

export function openingsForDate(
  date: string,
  config: AvailabilityConfig,
  now = new Date(),
): string[] {
  if (config.blockedDates.includes(date)) return [];
  const weekday = weekdayIndex(date);
  const hours = config.weekly[weekday] ?? { enabled: false, start: "09:00", end: "17:00" };
  const base = slotTimesForHours(hours, config.durationMinutes);
  const extras = config.extraSlots
    .filter((slot) => slot.date === date)
    .map((slot) => slot.time);
  const booked = new Set(
    config.bookedSlots
      .filter((slot) => slot.date === date)
      .map((slot) => slot.time),
  );
  const unique = Array.from(new Set([...base, ...extras])).sort();
  return unique.filter((time) => !booked.has(time) && !isSlotInPast(date, time, now));
}

export function datesWithOpenings(
  fromISO: string,
  days: number,
  config: AvailabilityConfig,
  now = new Date(),
) {
  const open = new Set<string>();
  for (let index = 0; index < days; index += 1) {
    const iso = addDays(fromISO, index);
    if (openingsForDate(iso, config, now).length > 0) open.add(iso);
  }
  return open;
}

export function defaultOpenDate(available: Set<string>, today = todayISO()) {
  if (available.has(today)) return today;
  return Array.from(available).sort()[0] ?? today;
}

export function demoAvailabilityConfig(
  bookedSlots: Array<{ date: string; time: string }> = [],
): AvailabilityConfig {
  return {
    weekly: DEFAULT_WEEKLY_HOURS,
    blockedDates: [],
    extraSlots: [],
    durationMinutes: SITE.defaultSessionDurationMinutes,
    bookedSlots,
  };
}
