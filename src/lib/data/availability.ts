import {
  demoAvailabilityConfig,
  openingsForDate,
  datesWithOpenings,
  type AvailabilityConfig,
  type WeekdayHours,
  DEFAULT_WEEKLY_HOURS,
} from "@/lib/availability";
import { SITE } from "@/lib/site";
import { TABLES } from "@/lib/tables";
import { todayISO } from "@/lib/dates";
import {
  createServiceClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/server";

export async function loadAvailabilityConfig(): Promise<{
  config: AvailabilityConfig;
  demo: boolean;
}> {
  if (!isServiceRoleConfigured()) {
    return { config: demoAvailabilityConfig(), demo: true };
  }

  const db = createServiceClient();
  const [rules, blocked, extras, booked] = await Promise.all([
    db.from(TABLES.availabilityRules).select("weekday, enabled, start_time, end_time"),
    db.from(TABLES.blockedDates).select("blocked_date"),
    db.from(TABLES.extraSlots).select("slot_date, start_time"),
    db
      .from(TABLES.bookings)
      .select("session_date, start_time, status, expires_at")
      .in("status", ["held", "confirmed"]),
  ]);

  const weekly: Record<number, WeekdayHours> = { ...DEFAULT_WEEKLY_HOURS };
  for (const row of rules.data ?? []) {
    weekly[row.weekday as number] = {
      enabled: Boolean(row.enabled),
      start: String(row.start_time).slice(0, 5),
      end: String(row.end_time).slice(0, 5),
    };
  }

  const now = new Date().toISOString();
  const bookedSlots = (booked.data ?? [])
    .filter((row) => {
      if (row.status === "held" && row.expires_at && row.expires_at < now) {
        return false;
      }
      return true;
    })
    .map((row) => ({
      date: String(row.session_date),
      time: String(row.start_time).slice(0, 5),
    }));

  return {
    demo: false,
    config: {
      weekly,
      blockedDates: (blocked.data ?? []).map((row) => String(row.blocked_date)),
      extraSlots: (extras.data ?? []).map((row) => ({
        date: String(row.slot_date),
        time: String(row.start_time).slice(0, 5),
      })),
      durationMinutes: SITE.defaultSessionDurationMinutes,
      bookedSlots,
    },
  };
}

export async function getOpenings(date: string) {
  const { config, demo } = await loadAvailabilityConfig();
  return { times: openingsForDate(date, config), demo };
}

export async function getOpenDates(days = 60) {
  const { config, demo } = await loadAvailabilityConfig();
  return { dates: datesWithOpenings(todayISO(), days, config), demo };
}

export async function isSlotAvailable(date: string, time: string) {
  const { times } = await getOpenings(date);
  return times.includes(time);
}
