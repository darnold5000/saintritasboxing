import {
  creditsDeductedPerBooking,
  offeringById,
  type CatalogOffering,
  type TrainingTypeId,
} from "@/lib/catalog";

export type PaymentStatus = "unpaid" | "paid" | "refunded" | "waived_credit";
export type BookingStatus = "held" | "confirmed" | "completed" | "cancelled";

export function canConfirmBooking(input: {
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
}) {
  return input.paymentStatus === "paid" || input.paymentStatus === "waived_credit";
}

export function shouldMarkPaidFromClientSuccess() {
  return false;
}

export type CreditAccount = {
  trainingType: TrainingTypeId;
  remaining: number;
  unlimitedActive: boolean;
};

export function canBookWithCredits(
  account: CreditAccount,
  trainingType: TrainingTypeId,
) {
  if (account.trainingType !== trainingType) return false;
  if (account.unlimitedActive && trainingType === "private") return true;
  return account.remaining >= creditsDeductedPerBooking(trainingType);
}

export function remainingAfterBooking(account: CreditAccount, trainingType: TrainingTypeId) {
  if (account.unlimitedActive && trainingType === "private") return account.remaining;
  return Math.max(0, account.remaining - creditsDeductedPerBooking(trainingType));
}

export function checkoutMode(offering: CatalogOffering): "payment" | "subscription" {
  return offering.kind === "subscription" ? "subscription" : "payment";
}

export function firstSessionRequired(offering: CatalogOffering) {
  return offering.kind === "single";
}

export function partnerRequiresSecondName(trainingType: TrainingTypeId) {
  return trainingType === "partner";
}

export function validateCustomerInput(input: {
  fullName: string;
  email: string;
  phone: string;
  trainingType: TrainingTypeId;
  partnerName?: string;
  isMinor?: boolean;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
}) {
  const errors: Record<string, string> = {};
  if (!input.fullName.trim()) errors.fullName = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (input.phone.replace(/\D/g, "").length < 10) {
    errors.phone = "Enter a phone number we can reach you at.";
  }
  if (partnerRequiresSecondName(input.trainingType) && !input.partnerName?.trim()) {
    errors.partnerName = "Enter the second participant’s name.";
  }
  if (input.isMinor) {
    if (!input.guardianName?.trim()) {
      errors.guardianName = "Enter a parent or guardian name.";
    }
    if (
      input.guardianEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.guardianEmail.trim())
    ) {
      errors.guardianEmail = "Enter a valid parent/guardian email.";
    }
    if (
      input.guardianPhone &&
      input.guardianPhone.replace(/\D/g, "").length < 10
    ) {
      errors.guardianPhone = "Enter a valid parent/guardian phone.";
    }
    if (!input.guardianEmail?.trim() && !input.guardianPhone?.trim()) {
      errors.guardianContact = "Enter a parent/guardian email or phone.";
    }
  }
  return errors;
}

export function offeringAllowsScheduling(offeringId: string) {
  return Boolean(offeringById(offeringId));
}

export const HOLD_MINUTES = 15;
