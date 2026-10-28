import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/auth/staff";
import { isServiceRoleConfigured } from "@/lib/supabase/server";
import { listAdminBookings, updateBookingStatus } from "@/lib/data/bookings";

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["completed", "cancelled", "confirmed"]),
});

export async function GET() {
  const staff = await getStaffSession();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
  const bookings = await listAdminBookings();
  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const staff = await getStaffSession();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  await updateBookingStatus(parsed.data.id, parsed.data.status);
  return NextResponse.json({ ok: true });
}
