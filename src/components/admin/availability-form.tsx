"use client";

import { useState } from "react";
import type { AvailabilityConfig } from "@/lib/availability";
import { Button } from "@/components/ui/button";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AvailabilityForm({
  config,
  demo,
}: {
  config: AvailabilityConfig;
  demo: boolean;
}) {
  const [weekly, setWeekly] = useState(config.weekly);
  const [blockDate, setBlockDate] = useState("");
  const [extraDate, setExtraDate] = useState("");
  const [extraTime, setExtraTime] = useState("09:00");
  const [message, setMessage] = useState("");

  async function saveHours() {
    const res = await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekly: Object.entries(weekly).map(([weekday, hours]) => ({
          weekday: Number(weekday),
          ...hours,
        })),
      }),
    });
    setMessage(res.ok ? "Hours saved." : "Could not save hours.");
  }

  async function addBlock() {
    if (!blockDate) return;
    await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockDate }),
    });
    setMessage("Blocked date added.");
  }

  async function addSlot() {
    if (!extraDate) return;
    await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ extraSlot: { date: extraDate, time: extraTime } }),
    });
    setMessage("Extra slot added.");
  }

  return (
    <div className="mt-6 space-y-8">
      {demo ? (
        <p className="rounded-md bg-amber-100 px-3 py-2 text-sm">
          Demo hours are shown. Saving requires a configured database and staff login.
        </p>
      ) : null}
      <div className="space-y-3 rounded-xl border border-border bg-white p-4">
        {DAYS.map((label, weekday) => {
          const hours = weekly[weekday];
          return (
            <div key={label} className="grid grid-cols-[140px_80px_1fr_1fr] items-center gap-3 text-sm">
              <span>{label}</span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hours.enabled}
                  onChange={(event) =>
                    setWeekly({
                      ...weekly,
                      [weekday]: { ...hours, enabled: event.target.checked },
                    })
                  }
                />
                Open
              </label>
              <input
                type="time"
                value={hours.start}
                onChange={(event) =>
                  setWeekly({ ...weekly, [weekday]: { ...hours, start: event.target.value } })
                }
                className="rounded border border-border px-2 py-1"
              />
              <input
                type="time"
                value={hours.end}
                onChange={(event) =>
                  setWeekly({ ...weekly, [weekday]: { ...hours, end: event.target.value } })
                }
                className="rounded border border-border px-2 py-1"
              />
            </div>
          );
        })}
        <Button onClick={() => void saveHours()}>Save hours</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-4">
          <h2 className="font-heading text-xl">Block a date</h2>
          <input
            type="date"
            value={blockDate}
            onChange={(event) => setBlockDate(event.target.value)}
            className="mt-3 w-full rounded border border-border px-2 py-2"
          />
          <div className="mt-3">
            <Button onClick={() => void addBlock()}>Block date</Button>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <h2 className="font-heading text-xl">Extra time slot</h2>
          <input
            type="date"
            value={extraDate}
            onChange={(event) => setExtraDate(event.target.value)}
            className="mt-3 w-full rounded border border-border px-2 py-2"
          />
          <input
            type="time"
            value={extraTime}
            onChange={(event) => setExtraTime(event.target.value)}
            className="mt-3 w-full rounded border border-border px-2 py-2"
          />
          <div className="mt-3">
            <Button onClick={() => void addSlot()}>Add slot</Button>
          </div>
        </div>
      </div>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}
