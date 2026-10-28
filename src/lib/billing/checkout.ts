import type Stripe from "stripe";
import { SITE } from "@/lib/site";
import { TABLES } from "@/lib/tables";
import { offeringById, type CatalogOffering } from "@/lib/catalog";
import { checkoutMode } from "@/lib/booking-rules";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import { createServiceClient } from "@/lib/supabase/server";
import { upsertCustomer } from "@/lib/data/customers";
import { createBooking } from "@/lib/data/bookings";

export async function createOfferingCheckout(input: {
  offeringId: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    partnerName?: string;
    isMinor?: boolean;
    guardianName?: string;
    guardianEmail?: string;
    guardianPhone?: string;
    notes?: string;
  };
  sessionDate?: string | null;
  startTime?: string | null;
}) {
  if (!isStripeConfigured()) {
    return {
      ok: false as const,
      code: "STRIPE_UNAVAILABLE",
      error:
        "Stripe is not configured. Add St. Rita's test keys before taking payments.",
    };
  }
  const offering = offeringById(input.offeringId);
  if (!offering) {
    return { ok: false as const, code: "INVALID_OFFERING", error: "Unknown training option." };
  }
  if (offering.kind === "single" && (!input.sessionDate || !input.startTime)) {
    return {
      ok: false as const,
      code: "SCHEDULE_REQUIRED",
      error: "Choose a date and time for this session.",
    };
  }

  const stripe = getStripe();
  if (!stripe) {
    return { ok: false as const, code: "STRIPE_UNAVAILABLE", error: "Stripe unavailable." };
  }

  const customer = await upsertCustomer(input.customer);
  const db = createServiceClient();

  const { data: purchase, error: purchaseError } = await db
    .from(TABLES.purchases)
    .insert({
      customer_id: customer.id,
      offering_id: offering.id,
      training_type: offering.trainingType,
      name: offering.name,
      kind: offering.kind,
      sessions_total: offering.sessions ?? 0,
      sessions_remaining: 0,
      amount_cents: offering.priceCents,
      status: "pending",
    })
    .select("id")
    .single();

  if (purchaseError || !purchase) {
    return {
      ok: false as const,
      code: "PURCHASE_FAILED",
      error: purchaseError?.message ?? "Could not start checkout.",
    };
  }

  let bookingId: string | null = null;
  if (input.sessionDate && input.startTime) {
    const booking = await createBooking({
      customerId: customer.id,
      offering,
      sessionDate: input.sessionDate,
      startTime: input.startTime,
      partnerName: input.customer.partnerName,
      notes: input.customer.notes,
      purchaseId: purchase.id,
      paymentStatus: "unpaid",
      status: "held",
    });
    bookingId = String(booking.id);
  }

  const mode = checkoutMode(offering);
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: offering.priceCents,
        product_data: {
          name: `${SITE.name} — ${offeringLabel(offering)}`,
          description: offering.description,
        },
        ...(mode === "subscription"
          ? { recurring: { interval: "month" as const } }
          : {}),
      },
    },
  ];

  const checkout = await stripe.checkout.sessions.create({
    mode,
    customer_email: customer.email,
    line_items: lineItems,
    success_url: `${SITE.url}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE.url}/book/cancelled`,
    client_reference_id: purchase.id,
    allow_promotion_codes: false,
    metadata: {
      business: "saintritasboxing",
      purchaseId: purchase.id,
      bookingId: bookingId ?? "",
      offeringId: offering.id,
      customerId: customer.id,
    },
    payment_intent_data:
      mode === "payment"
        ? {
            metadata: {
              business: "saintritasboxing",
              purchaseId: purchase.id,
            },
          }
        : undefined,
    subscription_data:
      mode === "subscription"
        ? {
            metadata: {
              business: "saintritasboxing",
              purchaseId: purchase.id,
              customerId: customer.id,
              offeringId: offering.id,
            },
          }
        : undefined,
  });

  if (!checkout.url) {
    return { ok: false as const, code: "CHECKOUT_URL", error: "Stripe did not return a checkout URL." };
  }

  await db
    .from(TABLES.purchases)
    .update({ stripe_checkout_id: checkout.id })
    .eq("id", purchase.id);

  if (bookingId) {
    await db
      .from(TABLES.bookings)
      .update({ stripe_checkout_id: checkout.id })
      .eq("id", bookingId);
  }

  return { ok: true as const, url: checkout.url, sessionId: checkout.id };
}

function offeringLabel(offering: CatalogOffering) {
  const type = offering.trainingType === "private" ? "1-on-1" : "2-on-1";
  return `${type} ${offering.name}`;
}

export async function createCustomerPortal(customerEmail: string) {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false as const, error: "Stripe is not configured." };
  }
  const db = createServiceClient();
  const { data: customer } = await db
    .from(TABLES.customers)
    .select("id, email, stripe_customer_id")
    .eq("email", customerEmail.trim().toLowerCase())
    .maybeSingle();
  if (!customer?.stripe_customer_id) {
    return { ok: false as const, error: "No Stripe customer is on file for this email." };
  }
  const portal = await stripe.billingPortal.sessions.create({
    customer: customer.stripe_customer_id,
    return_url: `${SITE.url}/my`,
  });
  return { ok: true as const, url: portal.url };
}
