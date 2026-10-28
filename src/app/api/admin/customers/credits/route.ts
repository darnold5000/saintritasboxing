import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/auth/staff";
import { isServiceRoleConfigured } from "@/lib/supabase/server";
import {
  adjustPurchaseCredits,
  listCustomerPurchases,
} from "@/lib/data/credits-admin";

const adjustSchema = z.object({
  purchaseId: z.string().uuid(),
  delta: z.number().int(),
  reason: z.string().min(3).max(500),
});

export async function GET(request: Request) {
  const staff = await getStaffSession();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const customerId = new URL(request.url).searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json({ error: "customerId is required." }, { status: 400 });
  }

  const purchases = await listCustomerPurchases(customerId);
  return NextResponse.json({ purchases });
}

export async function POST(request: Request) {
  const staff = await getStaffSession();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const parsed = adjustSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid adjustment." }, { status: 400 });
  }

  try {
    const result = await adjustPurchaseCredits({
      purchaseId: parsed.data.purchaseId,
      delta: parsed.data.delta,
      reason: parsed.data.reason,
      staffUserId: staff.user_id,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Adjustment failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
