"use client";

import { useState } from "react";
import type { TrainingTypeId } from "@/lib/catalog";

const TABS: { id: TrainingTypeId; label: string }[] = [
  { id: "private", label: "1:1" },
  { id: "partner", label: "2:1" },
  { id: "youth-class", label: "Youth class" },
  { id: "adult-class", label: "Adult class" },
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Draft = {
  key: string;
  weekday: number;
  start: string;
};

function toDrafts(slots: { weekday: number; start: string }[]): Draft[] {
  return slots
    .map((slot) => ({
      key: `${slot.weekday}-${slot.start}`,
      weekday: slot.weekday,
      start: slot.start.slice(0, 5),
    }))
    .sort((a, b) => a.weekday - b.weekday || a.start.localeCompare(b.start));
}

export function TrainingSchedule({
  initial,
  demo,
  scheduleReady,
}: {
  initial: Partial<Record<TrainingTypeId, { weekday: number; start: string }[]>>;
  demo: boolean;
  scheduleReady: boolean;
}) {
  const [tab, setTab] = useState<TrainingTypeId>("private");
  const [drafts, setDrafts] = useState<Record<TrainingTypeId, Draft[]>>({
    private: toDrafts(initial.private ?? []),
    partner: toDrafts(initial.partner ?? []),
    "youth-class": toDrafts(initial["youth-class"] ?? []),
    "adult-class": toDrafts(initial["adult-class"] ?? []),
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const rows = drafts[tab];

  function update(key: string, patch: Partial<Draft>) {
    setDrafts({
      ...drafts,
      [tab]: rows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    });
  }

  function addRow() {
    setDrafts({
      ...drafts,
      [tab]: [...rows, { key: crypto.randomUUID(), weekday: 1, start: "18:00" }],
    });
  }

  function removeRow(key: string) {
    setDrafts({
      ...drafts,
      [tab]: rows.filter((row) => row.key !== key),
    });
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainingType: tab,
        slots: rows.map((row) => ({ weekday: row.weekday, start: row.start })),
      }),
    });
    const body = (await res.json()) as { error?: string };
    setSaving(false);
    setMessage(res.ok ? "Schedule saved." : (body.error ?? "Could not save."));
  }

  return (
    <div className="mt-6">
      {demo ? (
        <p className="mb-4 rounded-md bg-amber-100 px-3 py-2 text-sm">
          Connect Supabase before saving. This preview is not the live booking calendar.
        </p>
      ) : null}
      {!demo && !scheduleReady ? (
        <p className="mb-4 rounded-md bg-amber-100 px-3 py-2 text-sm">
          Apply supabase/migrations/004_srb_training_slots.sql, then reload.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-1" role="tablist">
        {TABS.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                setTab(item.id);
                setMessage("");
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                selected ? "bg-brand text-white" : "bg-white text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-white p-4">
        <p className="text-sm text-muted-foreground">
          Add each day and start time. Change 6:00 to 6:30 in the time field, then save.
          Booking for this training only offers these times.
        </p>
        <div className="mt-4 space-y-3">
          {rows.length === 0 ? (
            <p className="text-sm">No times yet.</p>
          ) : (
            rows.map((row) => (
              <div key={row.key} className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Day"
                  value={row.weekday}
                  onChange={(event) => update(row.key, { weekday: Number(event.target.value) })}
                  className="rounded border border-border px-2 py-2 text-sm"
                >
                  {DAYS.map((label, weekday) => (
                    <option key={label} value={weekday}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  aria-label="Start time"
                  type="time"
                  value={row.start}
                  onChange={(event) => update(row.key, { start: event.target.value })}
                  className="rounded border border-border px-2 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  className="text-sm font-semibold text-red-700 underline"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addRow}
            className="rounded-md border border-border px-3 py-2 text-sm font-semibold"
          >
            Add day and time
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || demo || !scheduleReady}
            className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save schedule"}
          </button>
        </div>
        {message ? <p className="mt-3 text-sm">{message}</p> : null}
      </div>
    </div>
  );
}
