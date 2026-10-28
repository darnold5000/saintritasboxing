import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canBookWithCredits,
  canConfirmBooking,
  remainingAfterBooking,
  shouldMarkPaidFromClientSuccess,
  validateCustomerInput,
} from "./booking-rules";

describe("booking rules", () => {
  it("never marks paid from the Stripe return URL", () => {
    assert.equal(shouldMarkPaidFromClientSuccess(), false);
  });

  it("requires payment or credit before confirm", () => {
    assert.equal(
      canConfirmBooking({ paymentStatus: "unpaid", bookingStatus: "held" }),
      false,
    );
    assert.equal(
      canConfirmBooking({ paymentStatus: "paid", bookingStatus: "held" }),
      true,
    );
  });

  it("uses one credit for a partner session", () => {
    const account = {
      trainingType: "partner" as const,
      remaining: 5,
      unlimitedActive: false,
    };
    assert.equal(canBookWithCredits(account, "partner"), true);
    assert.equal(remainingAfterBooking(account, "partner"), 4);
  });

  it("validates partner and minor fields", () => {
    const errors = validateCustomerInput({
      fullName: "",
      email: "bad",
      phone: "123",
      trainingType: "partner",
      isMinor: true,
    });
    assert.ok(errors.fullName);
    assert.ok(errors.email);
    assert.ok(errors.phone);
    assert.ok(errors.partnerName);
    assert.ok(errors.guardianName);
  });
});
