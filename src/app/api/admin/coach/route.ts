import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/auth/staff";
import { coachErrorHint, saveCoachProfile } from "@/lib/data/coach";
import { readUploadedImage } from "@/lib/images";
import { isServiceRoleConfigured } from "@/lib/supabase/server";

const fieldsSchema = z.object({
  name: z.string().trim().max(80),
  roleTitle: z.string().trim().max(80),
  bio: z.string().trim().max(4000),
  removePhoto: z.boolean(),
});

async function requireStaff() {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
  return null;
}

export async function PUT(request: Request) {
  const denied = await requireStaff();
  if (denied) return denied;
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Check the bio fields and try again." }, { status: 400 });

  const parsed = fieldsSchema.safeParse({
    name: String(form.get("name") ?? ""),
    roleTitle: String(form.get("roleTitle") ?? ""),
    bio: String(form.get("bio") ?? ""),
    removePhoto: form.get("removePhoto") === "true",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the bio fields and try again." }, { status: 400 });
  }

  const photo = await readUploadedImage(form.get("photo"));
  if (photo && "error" in photo) {
    return NextResponse.json({ error: photo.error }, { status: 400 });
  }

  try {
    await saveCoachProfile({
      ...parsed.data,
      photo,
      removePhoto: parsed.data.removePhoto && !photo,
    });
  } catch (error) {
    return NextResponse.json(
      { error: coachErrorHint(error, "Could not save the coach profile.") },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}
