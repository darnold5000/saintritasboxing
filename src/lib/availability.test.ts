import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  demoAvailabilityConfig,
  openingsForDate,
  slotTimesForHours,
} from "./availability";

describe("availability", () => {
  it("builds 60-minute slots inside configured hours", () => {
    const times = slotTimesForHours(
      { enabled: true, start: "06:00", end: "08:00" },
      60,
    );
    assert.deepEqual(times, ["06:00", "07:00"]);
  });

  it("hides booked and blocked times", () => {
    const config = demoAvailabilityConfig([{ date: "2026-11-04", time: "09:00" }]);
    config.blockedDates = ["2026-11-05"];
    const wednesday = openingsForDate("2026-11-04", config, new Date("2026-11-01T12:00:00Z"));
    assert.equal(wednesday.includes("09:00"), false);
    assert.equal(wednesday.includes("10:00"), true);
    const blocked = openingsForDate("2026-11-05", config, new Date("2026-11-01T12:00:00Z"));
    assert.deepEqual(blocked, []);
  });
});
