import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { offeringById } from "@/lib/catalog";
import { firstSessionRequired, validateCustomerInput } from "@/lib/booking-rules";
import { getIntegrationStatus } from "@/lib/config-status";
import { isSlotAvailable } from "@/lib/data/availability";
import { createOfferingCheckout } from "@/lib/billing/checkout";

export const dynamic = "force-dynamic";

const schema = z.object({
  offeringId: z.string(),
  sessionDate: z.string().nullable().optional(),
  startTime: z.string().nullable().optional(),
  customer: z.object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string(),
    partnerName: z.string().optional(),
    isMinor: z.boolean().optional(),
    guardianName: z.string().optional(),
    guardianEmail: z.string().optional(),
    guardianPhone: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export async function POST(request: Request) {
  const limited = rateLimit(`checkout:${clientIp(request)}`, 8, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many checkout attempts. Try again later." }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking details." }, { status: 400 });
  }

  const offering = offeringById(parsed.data.offeringId);
  if (!offering) {
    return NextResponse.json({ error: "Unknown training option." }, { status: 400 });
  }

  const errors = validateCustomerInput({
    ...parsed.data.customer,
    trainingType: offering.trainingType,
  });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", errors }, { status: 400 });
  }

  if (firstSessionRequired(offering) && (!parsed.data.sessionDate || !parsed.data.startTime)) {
    return NextResponse.json({ error: "Choose a date and time." }, { status: 400 });
  }

  if (parsed.data.sessionDate && parsed.data.startTime) {
    const open = await isSlotAvailable(parsed.data.sessionDate, parsed.data.startTime);
    if (!open) {
      return NextResponse.json({ error: "That time is no longer available." }, { status: 409 });
    }
  }

  const status = getIntegrationStatus();
  if (!status.supabase || !status.stripe) {
    return NextResponse.json({
      demo: true,
      error: undefined,
      message:
        "Checkout is in demo mode until St. Rita's Stripe and Supabase credentials are configured. No payment was taken.",
    });
  }

  try {
    const result = await createOfferingCheckout({
      offeringId: parsed.data.offeringId,
      customer: parsed.data.customer,
      sessionDate: parsed.data.sessionDate,
      startTime: parsed.data.startTime,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ url: result.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
