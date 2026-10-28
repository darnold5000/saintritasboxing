import { NextResponse } from "next/server";
import { isStripeConfigured, verifyStripeWebhook } from "@/lib/stripe/server";
import { isServiceRoleConfigured } from "@/lib/supabase/server";
import { processStripeEvent } from "@/lib/billing/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isStripeConfigured() || !isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Stripe or database is not configured." }, { status: 503 });
  }

  const body = await request.text();
  const verified = verifyStripeWebhook({
    body,
    signature: request.headers.get("stripe-signature"),
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  });

  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: verified.status });
  }

  try {
    const result = await processStripeEvent(verified.event);
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    console.error("Stripe webhook processing error", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
