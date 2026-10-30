import {
  demoAvailabilityConfig,
  openingsForDate,
  datesWithOpenings,
  type AvailabilityConfig,
  type WeekdayHours,
  DEFAULT_WEEKLY_HOURS,
} from "@/lib/availability";
import { isClassTraining, TRAINING_TYPE_IDS, type TrainingTypeId } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { TABLES } from "@/lib/tables";
import { todayISO } from "@/lib/dates";
import {
  createServiceClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/server";

export type TrainingTime = {
  weekday: number;
  start: string;
};

export async function loadAvailabilityConfig(): Promise<{
  config: AvailabilityConfig;
  demo: boolean;
  slotsByType: Partial<Record<TrainingTypeId, TrainingTime[]>>;
  scheduleReady: boolean;
}> {
  if (!isServiceRoleConfigured()) {
    return { config: demoAvailabilityConfig(), demo: true, slotsByType: {}, scheduleReady: false };
  }

  const db = createServiceClient();
  const [rules, blocked, extras, booked, trainingSlots] = await Promise.all([
    db.from(TABLES.availabilityRules).select("weekday, enabled, start_time, end_time"),
    db.from(TABLES.blockedDates).select("blocked_date"),
    db.from(TABLES.extraSlots).select("slot_date, start_time"),
    db
      .from(TABLES.bookings)
      .select("session_date, start_time, status, expires_at")
      .in("status", ["held", "confirmed"]),
    db.from(TABLES.trainingSlots).select("training_type, weekday, start_time"),
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

  const slotsByType: Partial<Record<TrainingTypeId, TrainingTime[]>> = {};
  if (!trainingSlots.error) {
    for (const row of trainingSlots.data ?? []) {
      const type = String(row.training_type) as TrainingTypeId;
      if (!TRAINING_TYPE_IDS.includes(type)) continue;
      const list = slotsByType[type] ?? [];
      list.push({
        weekday: Number(row.weekday),
        start: String(row.start_time).slice(0, 5),
      });
      slotsByType[type] = list;
    }
  }

  return {
    demo: false,
    scheduleReady: !trainingSlots.error,
    slotsByType,
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

function configForType(
  config: AvailabilityConfig,
  slotsByType: Partial<Record<TrainingTypeId, TrainingTime[]>>,
  trainingType?: TrainingTypeId | null,
) {
  if (!trainingType) return config;
  const times = slotsByType[trainingType] ?? [];
  if (times.length > 0) {
    return { ...config, fixedTimes: times, weekdaysOnly: false };
  }
  if (isClassTraining(trainingType)) {
    return { ...config, weekdaysOnly: true };
  }
  return config;
}

export async function getOpenings(date: string, trainingType?: TrainingTypeId | null) {
  const { config, demo, slotsByType } = await loadAvailabilityConfig();
  return { times: openingsForDate(date, configForType(config, slotsByType, trainingType)), demo };
}

export async function getOpenDates(days = 60, trainingType?: TrainingTypeId | null) {
  const { config, demo, slotsByType } = await loadAvailabilityConfig();
  return {
    dates: datesWithOpenings(todayISO(), days, configForType(config, slotsByType, trainingType)),
    demo,
  };
}

export async function isSlotAvailable(
  date: string,
  time: string,
  trainingType?: TrainingTypeId | null,
) {
  const { times } = await getOpenings(date, trainingType);
  return times.includes(time.slice(0, 5));
}

export async function replaceTrainingSlots(
  trainingType: TrainingTypeId,
  slots: TrainingTime[],
) {
  const db = createServiceClient();
  const { error: clearError } = await db
    .from(TABLES.trainingSlots)
    .delete()
    .eq("training_type", trainingType);
  if (clearError) throw new Error(clearError.message);
  if (slots.length === 0) return;

  const unique = new Map<string, TrainingTime>();
  for (const slot of slots) {
    const start = slot.start.slice(0, 5);
    unique.set(`${slot.weekday}-${start}`, { weekday: slot.weekday, start });
  }
  const { error } = await db.from(TABLES.trainingSlots).insert(
    Array.from(unique.values()).map((slot) => ({
      training_type: trainingType,
      weekday: slot.weekday,
      start_time: slot.start,
    })),
  );
  if (error) throw new Error(error.message);
}
