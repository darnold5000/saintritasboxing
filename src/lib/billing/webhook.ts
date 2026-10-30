import type Stripe from "stripe";
import { TABLES } from "@/lib/tables";
import { offeringById, TRAINING_TYPES, type TrainingTypeId } from "@/lib/catalog";
import { formatLongDate, formatTime } from "@/lib/dates";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyOwner, sendTransactionalEmail } from "@/lib/email/send";
import {
  customerBookingEmail,
  customerPurchaseEmail,
  ownerBookingEmail,
} from "@/lib/email/templates";

export async function processStripeEvent(event: Stripe.Event) {
  const db = createServiceClient();
  const { error: insertError } = await db.from(TABLES.stripeEvents).insert({
    event_id: event.id,
    event_type: event.type,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { processed: false, duplicate: true };
    }
    throw new Error(insertError.message);
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
  }
  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    await handleSubscription(event.data.object as Stripe.Subscription);
  }

  return { processed: true, duplicate: false };
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid" && session.mode !== "subscription") {
    return;
  }
  if (session.mode === "subscription" && session.status !== "complete") {
    return;
  }

  const db = createServiceClient();
  const purchaseId = session.metadata?.purchaseId;
  if (!purchaseId) return;

  const { data: purchase } = await db
    .from(TABLES.purchases)
    .select("*")
    .eq("id", purchaseId)
    .maybeSingle();
  if (!purchase) return;
  if (purchase.status === "paid") return;

  const offering = offeringById(String(purchase.offering_id));
  const sessionsTotal = offering?.sessions ?? Number(purchase.sessions_total) ?? 0;
  const bookedNow = session.metadata?.bookingId ? 1 : 0;
  const remaining =
    offering?.kind === "subscription"
      ? 0
      : Math.max(0, sessionsTotal - bookedNow);

  await db
    .from(TABLES.purchases)
    .update({
      status: "paid",
      stripe_checkout_id: session.id,
      stripe_customer_id: customerId(session),
      sessions_remaining: remaining,
      paid_at: new Date().toISOString(),
    })
    .eq("id", purchaseId);

  if (customerId(session)) {
    await db
      .from(TABLES.customers)
      .update({ stripe_customer_id: customerId(session) })
      .eq("id", purchase.customer_id);
  }

  if (session.mode === "subscription" && session.subscription) {
    await db.from(TABLES.subscriptions).upsert(
      {
        customer_id: purchase.customer_id,
        offering_id: purchase.offering_id,
        stripe_subscription_id: String(session.subscription),
        stripe_customer_id: customerId(session),
        status: "active",
      },
      { onConflict: "stripe_subscription_id" },
    );
  }

  if (session.metadata?.bookingId) {
    await db
      .from(TABLES.bookings)
      .update({
        status: "confirmed",
        payment_status: "paid",
        expires_at: null,
      })
      .eq("id", session.metadata.bookingId);
  }

  await sendConfirmationEmails(String(purchase.customer_id), {
    offeringName: String(purchase.name),
    trainingType: String(purchase.training_type) as TrainingTypeId,
    sessions: offering?.sessions ?? null,
    priceCents: Number(purchase.amount_cents),
    bookingId: session.metadata?.bookingId || null,
  });
}

async function handleSubscription(subscription: Stripe.Subscription) {
  const db = createServiceClient();
  const status =
    subscription.status === "active" || subscription.status === "trialing"
      ? "active"
      : subscription.status === "canceled"
        ? "canceled"
        : subscription.status;
  await db
    .from(TABLES.subscriptions)
    .update({ status })
    .eq("stripe_subscription_id", subscription.id);
}

function customerId(session: Stripe.Checkout.Session) {
  if (typeof session.customer === "string") return session.customer;
  return session.customer?.id ?? null;
}

async function sendConfirmationEmails(
  customerIdValue: string,
  details: {
    offeringName: string;
    trainingType: TrainingTypeId;
    sessions: number | null;
    priceCents: number;
    bookingId: string | null;
  },
) {
  const db = createServiceClient();
  const { data: customer } = await db
    .from(TABLES.customers)
    .select("full_name, email, phone, partner_name")
    .eq("id", customerIdValue)
    .maybeSingle();
  if (!customer?.email) return;

  let date: string | undefined;
  let time: string | undefined;
  if (details.bookingId) {
    const { data: booking } = await db
      .from(TABLES.bookings)
      .select("session_date, start_time")
      .eq("id", details.bookingId)
      .maybeSingle();
    if (booking?.session_date) date = formatLongDate(String(booking.session_date));
    if (booking?.start_time) time = formatTime(String(booking.start_time).slice(0, 5));
  }

  const training = TRAINING_TYPES[details.trainingType].name;
  const purchase = customerPurchaseEmail({
    name: customer.full_name,
    offering: details.offeringName,
    sessions: details.sessions,
    priceCents: details.priceCents,
  });
  await sendTransactionalEmail({ ...purchase, to: customer.email, tag: "purchase" });

  if (details.bookingId) {
    const bookingMail = customerBookingEmail({
      name: customer.full_name,
      training,
      offering: details.offeringName,
      date,
      time,
      priceCents: details.priceCents,
    });
    await sendTransactionalEmail({ ...bookingMail, to: customer.email, tag: "booking" });
  }

  const ownerMail = ownerBookingEmail({
    name: customer.full_name,
    email: customer.email,
    phone: customer.phone ?? "",
    training,
    offering: details.offeringName,
    date,
    time,
    partnerName: customer.partner_name ?? undefined,
  });
  await notifyOwner({ ...ownerMail, tag: "owner-booking" });
}
