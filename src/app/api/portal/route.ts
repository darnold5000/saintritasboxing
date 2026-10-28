import { NextResponse } from "next/server";
import { z } from "zod";
import { createCustomerPortal } from "@/lib/billing/checkout";
import { getIntegrationStatus } from "@/lib/config-status";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const status = getIntegrationStatus();
  if (!status.stripe || !status.supabase) {
    return NextResponse.json(
      { error: "Stripe customer portal requires St. Rita's Stripe and Supabase configuration." },
      { status: 503 },
    );
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the email used at checkout." }, { status: 400 });
  }
  const result = await createCustomerPortal(parsed.data.email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ url: result.url });
}
