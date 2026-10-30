import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/auth/staff";
import { isServiceRoleConfigured } from "@/lib/supabase/server";
import { createReview, deleteReview, listAllReviews, updateReview } from "@/lib/data/reviews";

const bodySchema = z.object({
  reviewerName: z.string().trim().min(1).max(120),
  reviewerDescription: z.string().trim().max(200).optional().nullable(),
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().trim().min(8).max(2000),
  published: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999).optional(),
});

async function requireStaff() {
  const staff = await getStaffSession();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
  return null;
}

export async function GET() {
  const denied = await requireStaff();
  if (denied) return denied;
  const reviews = await listAllReviews();
  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  const denied = await requireStaff();
  if (denied) return denied;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the review fields and try again." }, { status: 400 });
  }
  await createReview(parsed.data);
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const denied = await requireStaff();
  if (denied) return denied;
  const parsed = z
    .object({ id: z.string().uuid() })
    .and(bodySchema)
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the review fields and try again." }, { status: 400 });
  }
  const { id, ...input } = parsed.data;
  await updateReview(id, input);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const denied = await requireStaff();
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Review id is required." }, { status: 400 });
  }
  await deleteReview(id);
  return NextResponse.json({ ok: true });
}
