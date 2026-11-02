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

  it("uses saved class times instead of the open-hours grid", () => {
    const config = demoAvailabilityConfig();
    config.fixedTimes = [{ weekday: 3, start: "18:30" }];
    const wednesday = openingsForDate("2026-11-04", config, new Date("2026-11-01T12:00:00Z"));
    assert.deepEqual(wednesday, ["18:30"]);
    const thursday = openingsForDate("2026-11-05", config, new Date("2026-11-01T12:00:00Z"));
    assert.deepEqual(thursday, []);
  });

  it("keeps a class inside its optional date window", () => {
    const config = demoAvailabilityConfig();
    config.fixedTimes = [
      { weekday: 3, start: "18:30", startsOn: "2026-11-01", endsOn: "2026-11-30" },
    ];
    const now = new Date("2026-10-01T12:00:00Z");
    assert.deepEqual(openingsForDate("2026-10-28", config, now), []);
    assert.deepEqual(openingsForDate("2026-11-04", config, now), ["18:30"]);
    assert.deepEqual(openingsForDate("2026-12-02", config, now), []);
  });

  it("closes class slots on weekends", () => {
    const config = demoAvailabilityConfig();
    config.weekdaysOnly = true;
    const saturday = openingsForDate("2026-11-07", config, new Date("2026-11-01T12:00:00Z"));
    assert.deepEqual(saturday, []);
    const wednesday = openingsForDate("2026-11-04", config, new Date("2026-11-01T12:00:00Z"));
    assert.equal(wednesday.length > 0, true);
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
