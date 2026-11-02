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

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  })
  .nullable();

const slotFields = z.object({
  trainingType: z.enum(TRAINING_TYPE_IDS),
  weekday: z.number().int().min(0).max(6),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  durationMinutes: z.number().int().min(15).max(480),
  published: z.boolean(),
  startsOn: optionalDate,
  endsOn: optionalDate,
});

function datesInOrder(value: { startsOn: string | null; endsOn: string | null }) {
  return !value.startsOn || !value.endsOn || value.endsOn >= value.startsOn;
}

const slotSchema = slotFields.refine(datesInOrder, {
  message: "End date must be on or after the start date.",
});
const patchSchema = slotFields.extend({ id: z.string().uuid() }).refine(datesInOrder, {
  message: "End date must be on or after the start date.",
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
  if (
    message.includes("srb_training_slots") ||
    message.includes("duration_minutes") ||
    message.includes("starts_on") ||
    message.includes("ends_on")
  ) {
    return "Apply migrations 004, 005, and 006, then try again.";
  }
  if (message.includes("date_range")) {
    return "End date must be on or after the start date.";
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
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
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
