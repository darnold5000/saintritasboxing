import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/auth/staff";
import { TRAINING_TYPE_IDS } from "@/lib/catalog";
import {
  createTrainingSlot,
  deleteTrainingSlot,
  updateTrainingSlot,
} from "@/lib/data/availability";
import { isServiceRoleConfigured } from "@/lib/supabase/server";

const slotSchema = z.object({
  trainingType: z.enum(TRAINING_TYPE_IDS),
  weekday: z.number().int().min(0).max(6),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  durationMinutes: z.number().int().min(15).max(480),
  published: z.boolean(),
});

async function requireStaff() {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
  return null;
}

function saveError(error: unknown) {
  const message = error instanceof Error ? error.message : "Could not save the class.";
  if (message.includes("23505") || message.toLowerCase().includes("duplicate")) {
    return "That day already has a class at this time.";
  }
  if (message.includes("srb_training_slots") || message.includes("duration_minutes")) {
    return "Apply migrations 004 and 005, then try again.";
  }
  return message;
}

export async function POST(request: Request) {
  const denied = await requireStaff();
  if (denied) return denied;
  const parsed = slotSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the time and length, then save again." }, { status: 400 });
  }
  try {
    const slot = await createTrainingSlot(parsed.data);
    return NextResponse.json({ slot });
  } catch (error) {
    return NextResponse.json({ error: saveError(error) }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const denied = await requireStaff();
  if (denied) return denied;
  const parsed = slotSchema
    .extend({ id: z.string().uuid() })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the time and length, then save again." }, { status: 400 });
  }
  const { id, ...input } = parsed.data;
  try {
    const slot = await updateTrainingSlot(id, input);
    return NextResponse.json({ slot });
  } catch (error) {
    return NextResponse.json({ error: saveError(error) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireStaff();
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Class id is required." }, { status: 400 });
  }
  try {
    await deleteTrainingSlot(id);
  } catch (error) {
    return NextResponse.json({ error: saveError(error) }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
