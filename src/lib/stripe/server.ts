import Stripe from "stripe";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key);
}

export function verifyStripeWebhook(input: {
  body: string;
  signature: string | null;
  webhookSecret: string | undefined;
}): { ok: true; event: Stripe.Event } | { ok: false; error: string; status: number } {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, error: "Stripe not configured", status: 503 };
  }
  if (!input.signature || !input.webhookSecret?.trim()) {
    return { ok: false, error: "Missing Stripe signature", status: 400 };
  }
  try {
    const event = stripe.webhooks.constructEvent(
      input.body,
      input.signature,
      input.webhookSecret,
    );
    return { ok: true, event };
  } catch {
    return { ok: false, error: "Invalid Stripe signature", status: 400 };
  }
}
