import { SITE } from "@/lib/site";

export function todayISO(now = new Date()) {
  return now.toLocaleDateString("en-CA", { timeZone: SITE.timezone });
}

export function parseISODate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(iso: string, days: number) {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return formatISODate(date);
}

export function startOfWeek(iso: string) {
  const date = parseISODate(iso);
  date.setDate(date.getDate() - date.getDay());
  return formatISODate(date);
}

export function weekdayLabel(iso: string, width: "short" | "long" = "short") {
  return parseISODate(iso).toLocaleDateString("en-US", { weekday: width });
}

export function dayNumber(iso: string) {
  return parseISODate(iso).getDate();
}

export function formatLongDate(iso: string) {
  return parseISODate(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(time: string) {
  const [hourRaw, minute] = time.split(":").map(Number);
  const suffix = hourRaw >= 12 ? "PM" : "AM";
  const hour = hourRaw % 12 || 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function addMinutes(time: string, minutes: number) {
  const [hour, minute] = time.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  const nextHour = Math.floor(total / 60) % 24;
  const nextMinute = total % 60;
  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}

export function weekDays(weekISO: string) {
  const start = startOfWeek(weekISO);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function isPastDate(iso: string, today = todayISO()) {
  return iso < today;
}

export function weekdayIndex(iso: string) {
  return parseISODate(iso).getDay();
}

export function currentHourInTimezone(now = new Date()) {
  const hour = now.toLocaleString("en-US", {
    timeZone: SITE.timezone,
    hour: "2-digit",
    hour12: false,
  });
  return Number(hour);
}
