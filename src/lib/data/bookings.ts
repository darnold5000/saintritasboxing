import { HOLD_MINUTES } from "@/lib/booking-rules";
import { SITE } from "@/lib/site";
import { TABLES } from "@/lib/tables";
import type { CatalogOffering } from "@/lib/catalog";
import { createServiceClient } from "@/lib/supabase/server";
import { isSlotAvailable } from "@/lib/data/availability";

export type BookingInsert = {
  customerId: string;
  offering: CatalogOffering;
  sessionDate: string | null;
  startTime: string | null;
  partnerName?: string | null;
  notes?: string | null;
  stripeCheckoutId?: string | null;
  purchaseId?: string | null;
  paymentStatus: "unpaid" | "paid" | "waived_credit";
  status: "held" | "confirmed";
};

export async function createBooking(input: BookingInsert) {
  if (input.sessionDate && input.startTime) {
    const open = await isSlotAvailable(
      input.sessionDate,
      input.startTime,
      input.offering.trainingType,
    );
    if (!open) {
      throw new Error("That time is no longer available.");
    }
  }

  const db = createServiceClient();
  const expiresAt =
    input.status === "held"
      ? new Date(Date.now() + HOLD_MINUTES * 60 * 1000).toISOString()
      : null;

  const { data, error } = await db
    .from(TABLES.bookings)
    .insert({
      customer_id: input.customerId,
      offering_id: input.offering.id,
      training_type: input.offering.trainingType,
      offering_name: input.offering.name,
      session_date: input.sessionDate,
      start_time: input.startTime,
      duration_minutes: SITE.defaultSessionDurationMinutes,
      location: SITE.address.full,
      partner_name: input.partnerName ?? null,
      notes: input.notes ?? null,
      status: input.status,
      payment_status: input.paymentStatus,
      purchase_id: input.purchaseId ?? null,
      stripe_checkout_id: input.stripeCheckoutId ?? null,
      expires_at: expiresAt,
      amount_cents: input.offering.priceCents,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("That time was just booked. Choose another slot.");
    }
    throw new Error(error.message);
  }
  return data;
}

export async function listAdminBookings() {
  const db = createServiceClient();
  const { data, error } = await db
    .from(TABLES.bookings)
    .select(
      "id, session_date, start_time, training_type, offering_name, status, payment_status, partner_name, created_at, customers:customer_id(full_name, email, phone, is_minor, guardian_name, guardian_email, guardian_phone)",
    )
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateBookingStatus(
  id: string,
  status: "completed" | "cancelled" | "confirmed",
) {
  const db = createServiceClient();
  const { error } = await db.from(TABLES.bookings).update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export { clientNameFromBookingRow } from "@/lib/admin/client-display";

export const SAMPLE_BOOKINGS = [
  {
    id: "demo-1",
    session_date: "2026-11-04",
    start_time: "09:00",
    training_type: "private",
    offering_name: "Single Session",
    status: "confirmed",
    payment_status: "paid",
    customers: {
      full_name: "Jordan Lee",
      email: "youth@example.com",
      phone: "(555) 010-0100",
      is_minor: true,
      guardian_name: "Taylor Lee",
      guardian_email: "parent@example.com",
      guardian_phone: "(555) 010-0199",
    },
  },
  {
    id: "demo-2",
    session_date: "2026-11-05",
    start_time: "18:00",
    training_type: "partner",
    offering_name: "5 Session Package",
    status: "confirmed",
    payment_status: "waived_credit",
    customers: { full_name: "Sample Pair", email: "pair@example.com", phone: "(555) 010-0101" },
  },
];
