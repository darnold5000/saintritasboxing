import { NextResponse } from "next/server";
import { z } from "zod";
import { TRAINING_TYPE_IDS } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { validateCustomerInput } from "@/lib/booking-rules";
import { getIntegrationStatus } from "@/lib/config-status";
import { isSlotAvailable } from "@/lib/data/availability";
import {
  customerCredits,
  issueAccessToken,
  pickCreditForType,
  upsertCustomer,
} from "@/lib/data/customers";
import { sendTransactionalEmail } from "@/lib/email/send";
import { bookingConfirmEmail } from "@/lib/email/templates";
import { formatLongDate, formatTime } from "@/lib/dates";

const schema = z.object({
  trainingType: z.enum(TRAINING_TYPE_IDS),
  sessionDate: z.string(),
  startTime: z.string(),
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
  const limited = rateLimit(`credit-book:${clientIp(request)}`, 8, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking details." }, { status: 400 });
  }

  const errors = validateCustomerInput({
    ...parsed.data.customer,
    trainingType: parsed.data.trainingType,
  });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", errors }, { status: 400 });
  }

  const status = getIntegrationStatus();
  if (!status.supabase) {
    return NextResponse.json({
      demo: true,
      message: "Credit booking needs Supabase configured.",
    });
  }

  const open = await isSlotAvailable(
    parsed.data.sessionDate,
    parsed.data.startTime,
    parsed.data.trainingType,
  );
  if (!open) {
    return NextResponse.json({ error: "That time is no longer available." }, { status: 409 });
  }

  await upsertCustomer(parsed.data.customer);

  const credits = await customerCredits(parsed.data.customer.email);
  const usable = credits ? pickCreditForType(credits, parsed.data.trainingType) : null;
  if (!usable || (!usable.unlimitedActive && usable.remaining <= 0)) {
    return NextResponse.json({ error: "No session credits available for this training type." }, { status: 400 });
  }

  const token = await issueAccessToken(parsed.data.customer.email);
  const params = new URLSearchParams({
    token,
    type: parsed.data.trainingType,
    date: parsed.data.sessionDate,
    time: parsed.data.startTime,
  });
  const confirmUrl = `${SITE.url}/book?${params.toString()}`;

  if (status.resend) {
    const mail = bookingConfirmEmail({
      name: parsed.data.customer.fullName,
      date: formatLongDate(parsed.data.sessionDate),
      time: formatTime(parsed.data.startTime),
      url: confirmUrl,
    });
    await sendTransactionalEmail({
      ...mail,
      to: parsed.data.customer.email,
      tag: "booking-confirm",
    });
  }

  return NextResponse.json({
    ok: true,
    message: status.resend
      ? "Check your email for a link to confirm this session with your credit."
      : "Resend is not configured. Use this one-time link to confirm:",
    confirmUrl: status.resend ? undefined : confirmUrl,
  });
}
