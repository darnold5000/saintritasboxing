import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/auth/staff";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/server";
import { TABLES } from "@/lib/tables";
import { loadAvailabilityConfig } from "@/lib/data/availability";

const schema = z.object({
  weekly: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        enabled: z.boolean(),
        start: z.string(),
        end: z.string(),
      }),
    )
    .optional(),
  blockDate: z.string().optional(),
  extraSlot: z.object({ date: z.string(), time: z.string() }).optional(),
});

export async function GET() {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await loadAvailabilityConfig();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid availability update." }, { status: 400 });
  }
  const db = createServiceClient();
  if (parsed.data.weekly) {
    for (const row of parsed.data.weekly) {
      await db.from(TABLES.availabilityRules).upsert({
        weekday: row.weekday,
        enabled: row.enabled,
        start_time: row.start,
        end_time: row.end,
      });
    }
  }
  if (parsed.data.blockDate) {
    await db.from(TABLES.blockedDates).insert({ blocked_date: parsed.data.blockDate });
  }
  if (parsed.data.extraSlot) {
    await db.from(TABLES.extraSlots).insert({
      slot_date: parsed.data.extraSlot.date,
      start_time: parsed.data.extraSlot.time,
    });
  }
  return NextResponse.json({ ok: true });
}
