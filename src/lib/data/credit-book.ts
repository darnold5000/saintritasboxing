import { offeringById } from "@/lib/catalog";
import { canBookWithCredits, remainingAfterBooking } from "@/lib/booking-rules";
import { TABLES } from "@/lib/tables";
import { createServiceClient } from "@/lib/supabase/server";
import { customerCredits, pickCreditForType } from "@/lib/data/customers";
import { createBooking } from "@/lib/data/bookings";
import type { TrainingTypeId } from "@/lib/catalog";

export async function bookWithCredits(input: {
  email: string;
  trainingType: TrainingTypeId;
  sessionDate: string;
  startTime: string;
  partnerName?: string;
  notes?: string;
}) {
  const credits = await customerCredits(input.email);
  if (!credits) {
    return { ok: false as const, error: "No training account found for that email." };
  }
  const usable = pickCreditForType(credits, input.trainingType);
  if (!usable || !canBookWithCredits(usable, input.trainingType)) {
    return {
      ok: false as const,
      error: "No remaining sessions for this training type.",
    };
  }

  const offeringId =
    input.trainingType === "private" ? "private-single" : "partner-single";
  const offering = offeringById(offeringId);
  if (!offering) {
    return { ok: false as const, error: "Training option is unavailable." };
  }

  const db = createServiceClient();
  const booking = await createBooking({
    customerId: credits.customer.id,
    offering,
    sessionDate: input.sessionDate,
    startTime: input.startTime,
    partnerName: input.partnerName,
    notes: input.notes,
    purchaseId: usable.purchaseId,
    paymentStatus: "waived_credit",
    status: "confirmed",
  });

  if (usable.purchaseId && !usable.unlimitedActive) {
    const next = remainingAfterBooking(usable, input.trainingType);
    const { error } = await db
      .from(TABLES.purchases)
      .update({ sessions_remaining: next })
      .eq("id", usable.purchaseId)
      .gt("sessions_remaining", 0);
    if (error) {
      await db.from(TABLES.bookings).update({ status: "cancelled" }).eq("id", booking.id);
      return { ok: false as const, error: "Could not apply a session credit." };
    }
  }

  return { ok: true as const, bookingId: String(booking.id) };
}
