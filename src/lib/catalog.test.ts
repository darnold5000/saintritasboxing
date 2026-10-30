import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  OFFERINGS,
  creditsDeductedPerBooking,
  formatUsd,
  membershipCoversTraining,
  packageSavings,
  REGISTRATION_FEE,
} from "./catalog";

describe("St. Rita catalog", () => {
  it("matches flyer prices", () => {
    const byId = Object.fromEntries(OFFERINGS.map((item) => [item.id, item.priceCents]));
    assert.equal(byId["private-single"], 5000);
    assert.equal(byId["private-5"], 22500);
    assert.equal(byId["private-10"], 40000);
    assert.equal(byId["private-20"], 70000);
    assert.equal(byId["private-unlimited"], 80000);
    assert.equal(byId["partner-single"], 7000);
    assert.equal(byId["partner-5"], 32500);
    assert.equal(byId["partner-10"], 60000);
  });

  it("computes accurate package savings", () => {
    const five = packageSavings(OFFERINGS.find((item) => item.id === "private-5")!);
    assert.equal(five?.savedCents, 2500);
    const ten = packageSavings(OFFERINGS.find((item) => item.id === "private-10")!);
    assert.equal(ten?.savedCents, 10000);
    const twenty = packageSavings(OFFERINGS.find((item) => item.id === "private-20")!);
    assert.equal(twenty?.savedCents, 30000);
    const partnerFive = packageSavings(OFFERINGS.find((item) => item.id === "partner-5")!);
    assert.equal(partnerFive?.savedCents, 2500);
    const partnerTen = packageSavings(OFFERINGS.find((item) => item.id === "partner-10")!);
    assert.equal(partnerTen?.savedCents, 10000);
  });

  it("keeps class memberships on their own training type", () => {
    assert.equal(membershipCoversTraining("class-adult-unlimited", "adult-class"), true);
    assert.equal(membershipCoversTraining("class-youth-unlimited", "youth-class"), true);
    assert.equal(membershipCoversTraining("class-adult-unlimited", "youth-class"), false);
    assert.equal(membershipCoversTraining("private-unlimited", "adult-class"), false);
    assert.equal(membershipCoversTraining("class-adult-unlimited", "private"), false);
  });

  it("deducts one partner credit per booking", () => {
    assert.equal(creditsDeductedPerBooking("partner"), 1);
    assert.equal(creditsDeductedPerBooking("private"), 1);
  });

  it("does not auto-charge the registration fee", () => {
    assert.equal(REGISTRATION_FEE.autoCharge, false);
    assert.equal(REGISTRATION_FEE.amountCents, 2500);
  });

  it("formats whole-dollar prices without cents", () => {
    assert.equal(formatUsd(5000), "$50");
  });
});
