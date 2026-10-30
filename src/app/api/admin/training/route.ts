import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/auth/staff";
import { TRAINING_TYPE_IDS } from "@/lib/catalog";
import { replaceTrainingSlots } from "@/lib/data/availability";
import { isServiceRoleConfigured } from "@/lib/supabase/server";

const schema = z.object({
  trainingType: z.enum(TRAINING_TYPE_IDS),
  slots: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        start: z.string().regex(/^\d{2}:\d{2}$/),
      }),
    )
    .max(40),
});

export async function POST(request: Request) {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the day and time, then save again." }, { status: 400 });
  }
  try {
    await replaceTrainingSlots(parsed.data.trainingType, parsed.data.slots);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save the schedule.";
    return NextResponse.json(
      {
        error: message.includes("srb_training_slots")
          ? "Apply supabase/migrations/004_srb_training_slots.sql, then save again."
          : message,
      },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}
