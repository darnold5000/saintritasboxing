import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/auth/staff";
import {
  createGalleryImage,
  deleteGalleryImage,
  galleryErrorHint,
  updateGalleryCaption,
} from "@/lib/data/gallery";
import { readUploadedImage } from "@/lib/images";
import { isServiceRoleConfigured } from "@/lib/supabase/server";

async function requireStaff() {
  const staff = await getStaffSession();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
  return null;
}

export async function POST(request: Request) {
  const denied = await requireStaff();
  if (denied) return denied;
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Choose an image to add." }, { status: 400 });

  const caption = z.string().trim().max(240).safeParse(String(form.get("caption") ?? ""));
  if (!caption.success) {
    return NextResponse.json({ error: "Caption must be 240 characters or fewer." }, { status: 400 });
  }
  const photo = await readUploadedImage(form.get("image"));
  if (!photo) return NextResponse.json({ error: "Choose an image to add." }, { status: 400 });
  if ("error" in photo) return NextResponse.json({ error: photo.error }, { status: 400 });

  try {
    await createGalleryImage({
      ...photo,
      caption: caption.data || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: galleryErrorHint(error, "Could not save the gallery.") },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const denied = await requireStaff();
  if (denied) return denied;
  const parsed = z
    .object({
      id: z.string().uuid(),
      caption: z.string().trim().max(240),
    })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Caption must be 240 characters or fewer." }, { status: 400 });
  }
  try {
    await updateGalleryCaption(parsed.data.id, parsed.data.caption || null);
  } catch (error) {
    return NextResponse.json(
      { error: galleryErrorHint(error, "Could not save the gallery.") },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const denied = await requireStaff();
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Image id is required." }, { status: 400 });
  }
  try {
    await deleteGalleryImage(id);
  } catch (error) {
    return NextResponse.json(
      { error: galleryErrorHint(error, "Could not delete the image.") },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}
