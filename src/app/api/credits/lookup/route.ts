import { NextResponse } from "next/server";
import { z } from "zod";
import { TRAINING_TYPE_IDS } from "@/lib/catalog";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getIntegrationStatus } from "@/lib/config-status";
import { customerCredits, pickCreditForType } from "@/lib/data/customers";
import { isServiceRoleConfigured } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email(),
  trainingType: z.enum(TRAINING_TYPE_IDS),
});

export async function POST(request: Request) {
  const limited = rateLimit(`credit-lookup:${clientIp(request)}`, 20, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many lookups. Try again shortly." }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!getIntegrationStatus().supabase || !isServiceRoleConfigured()) {
    return NextResponse.json({
      configured: false,
      hasCredit: false,
      remaining: 0,
      unlimitedActive: false,
    });
  }

  const credits = await customerCredits(parsed.data.email);
  if (!credits) {
    return NextResponse.json({
      configured: true,
      hasCredit: false,
      remaining: 0,
      unlimitedActive: false,
    });
  }

  const usable = pickCreditForType(credits, parsed.data.trainingType);
  const unlimitedActive = Boolean(usable?.unlimitedActive);

  return NextResponse.json({
    configured: true,
    hasCredit: Boolean(usable && (usable.unlimitedActive || usable.remaining > 0)),
    remaining: usable?.unlimitedActive ? null : (usable?.remaining ?? 0),
    unlimitedActive,
  });
}
