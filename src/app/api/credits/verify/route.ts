import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeAccessToken, customerCredits, lookupAccessToken, upsertCustomer } from "@/lib/data/customers";
import { bookWithCredits } from "@/lib/data/credit-book";
import { TRAINING_TYPE_IDS } from "@/lib/catalog";

const bookSchema = z.object({
  token: z.string().min(10),
  trainingType: z.enum(TRAINING_TYPE_IDS),
  sessionDate: z.string(),
  startTime: z.string(),
  customer: z
    .object({
      fullName: z.string(),
      email: z.string(),
      phone: z.string(),
      partnerName: z.string().optional(),
      isMinor: z.boolean().optional(),
      guardianName: z.string().optional(),
      guardianEmail: z.string().optional(),
      guardianPhone: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
});

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const found = await lookupAccessToken(token);
  if (!found) {
    return NextResponse.json({ error: "This link is invalid or expired." }, { status: 400 });
  }
  const email = found.email;
  const credits = await customerCredits(email);
  return NextResponse.json({ email, credits });
}

export async function POST(request: Request) {
  const parsed = bookSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking request." }, { status: 400 });
  }
  const email = await consumeAccessToken(parsed.data.token);
  if (!email) {
    return NextResponse.json({ error: "This link is invalid or expired." }, { status: 400 });
  }

  if (parsed.data.customer) {
    await upsertCustomer(parsed.data.customer);
  }

  const result = await bookWithCredits({
    email,
    trainingType: parsed.data.trainingType,
    sessionDate: parsed.data.sessionDate,
    startTime: parsed.data.startTime,
    partnerName: parsed.data.customer?.partnerName,
    notes: parsed.data.customer?.notes,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, bookingId: result.bookingId });
}
