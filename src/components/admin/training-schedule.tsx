"use client";

import { useState } from "react";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import type { TrainingTypeId } from "@/lib/catalog";
import type { TrainingTime } from "@/lib/data/availability";
import { formatTime } from "@/lib/dates";

const TABS: { id: TrainingTypeId; label: string }[] = [
  { id: "private", label: "1:1" },
  { id: "partner", label: "2:1" },
  { id: "youth-class", label: "Youth class" },
  { id: "adult-class", label: "Adult class" },
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIME_OPTIONS = Array.from({ length: 32 }, (_, index) => {
  const minutes = 6 * 60 + index * 30;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

type FormState = {
  weekday: number;
  id: string | null;
  start: string;
  custom: boolean;
  hours: string;
  minutes: string;
  published: boolean;
};

function splitDuration(total: number) {
  return {
    hours: String(Math.floor(total / 60)),
    minutes: String(total % 60),
  };
}

function lengthLabel(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const hourText = hours > 0 ? `${hours} hr${hours === 1 ? "" : "s"}` : "";
  const minuteText = minutes > 0 ? `${minutes} min` : "";
  return [hourText, minuteText].filter(Boolean).join(" ") || "0 min";
}

export function TrainingSchedule({
  initial,
  demo,
  scheduleReady,
}: {
  initial: Partial<Record<TrainingTypeId, TrainingTime[]>>;
  demo: boolean;
  scheduleReady: boolean;
}) {
  const [tab, setTab] = useState<TrainingTypeId>("private");
  const [slots, setSlots] = useState<Record<TrainingTypeId, TrainingTime[]>>({
    private: initial.private ?? [],
    partner: initial.partner ?? [],
    "youth-class": initial["youth-class"] ?? [],
    "adult-class": initial["adult-class"] ?? [],
  });
  const [form, setForm] = useState<FormState | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const rows = slots[tab];

  function openAdd(weekday: number) {
    setMessage("");
    setForm({
      weekday,
      id: null,
      start: "18:00",
      custom: false,
      hours: "1",
      minutes: "0",
      published: true,
    });
  }

  function openEdit(slot: TrainingTime) {
    setMessage("");
    const parts = splitDuration(slot.durationMinutes);
    setForm({
      weekday: slot.weekday,
      id: slot.id,
      start: slot.start,
      custom: !TIME_OPTIONS.includes(slot.start),
      hours: parts.hours,
      minutes: parts.minutes,
      published: slot.published,
    });
  }

  async function saveForm() {
    if (!form) return;
    const hours = Number(form.hours);
    const minutes = Number(form.minutes);
    const durationMinutes = hours * 60 + minutes;
    if (
      !/^\d{2}:\d{2}$/.test(form.start) ||
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      hours < 0 ||
      minutes < 0 ||
      minutes > 59 ||
      durationMinutes < 15 ||
      durationMinutes > 480
    ) {
      setMessage("Enter a start time and a length between 15 minutes and 8 hours.");
      return;
    }
    setSaving(true);
    setMessage("");
    const payload = {
      trainingType: tab,
      weekday: form.weekday,
      start: form.start,
      durationMinutes,
      published: form.published,
    };
    const res = await fetch("/api/admin/training", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.id ? { id: form.id, ...payload } : payload),
    });
    const body = (await res.json()) as { error?: string; slot?: TrainingTime };
    setSaving(false);
    if (!res.ok || !body.slot) {
      setMessage(body.error ?? "Could not save.");
      return;
    }
    setSlots((current) => {
      const next = current[tab].filter((slot) => slot.id !== body.slot!.id);
      next.push(body.slot!);
      return { ...current, [tab]: next };
    });
    setForm(null);
    setMessage("Saved.");
  }

  async function remove(slot: TrainingTime) {
    if (!window.confirm(`Remove ${formatTime(slot.start)} on ${DAYS[slot.weekday]}?`)) return;
    setMessage("");
    const res = await fetch(`/api/admin/training?id=${slot.id}`, { method: "DELETE" });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(body.error ?? "Could not delete.");
      return;
    }
    setSlots((current) => ({
      ...current,
      [tab]: current[tab].filter((item) => item.id !== slot.id),
    }));
    if (form?.id === slot.id) setForm(null);
  }

  async function togglePublic(slot: TrainingTime) {
    setMessage("");
    const res = await fetch("/api/admin/training", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: slot.id,
        trainingType: tab,
        weekday: slot.weekday,
        start: slot.start,
        durationMinutes: slot.durationMinutes,
        published: !slot.published,
      }),
    });
    const body = (await res.json()) as { error?: string; slot?: TrainingTime };
    if (!res.ok || !body.slot) {
      setMessage(body.error ?? "Could not update visibility.");
      return;
    }
    setSlots((current) => ({
      ...current,
      [tab]: current[tab].map((item) => (item.id === body.slot!.id ? body.slot! : item)),
    }));
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
          Apply migrations 004 and 005, then reload.
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
                setForm(null);
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

      <div className="mt-4 space-y-3 rounded-xl border border-border bg-white p-4">
        <p className="text-sm text-muted-foreground">
          Add a class on a day, set the start time and length, then save. Public classes show on
          the booking page. Hidden classes stay here for staff only.
        </p>
        {DAYS.map((label, weekday) => {
          const daySlots = rows
            .filter((slot) => slot.weekday === weekday)
            .sort((a, b) => a.start.localeCompare(b.start));
          const adding = form?.weekday === weekday && form.id === null;
          return (
            <div
              key={label}
              className="grid items-start gap-3 border-t border-border py-3 first:border-t-0 sm:grid-cols-[140px_1fr]"
            >
              <p className="pt-2 text-sm font-semibold">{label}</p>
              <div className="space-y-2">
                {daySlots.map((slot) =>
                  form?.id === slot.id ? (
                    <ClassForm
                      key={slot.id}
                      form={form}
                      saving={saving}
                      disabled={demo || !scheduleReady}
                      onChange={setForm}
                      onCancel={() => setForm(null)}
                      onSave={() => void saveForm()}
                    />
                  ) : (
                    <div key={slot.id} className="flex flex-wrap items-center gap-2">
                      <p className={`text-sm ${slot.published ? "" : "text-muted-foreground"}`}>
                        {formatTime(slot.start)} · {lengthLabel(slot.durationMinutes)}
                        {slot.published ? "" : " · Hidden"}
                      </p>
                      <IconButton label="Edit class" onClick={() => openEdit(slot)}>
                        <Pencil className="size-4" />
                      </IconButton>
                      <IconButton
                        label={slot.published ? "Hide from public" : "Make public"}
                        onClick={() => void togglePublic(slot)}
                      >
                        {slot.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </IconButton>
                      <IconButton label="Delete class" onClick={() => void remove(slot)}>
                        <Trash2 className="size-4" />
                      </IconButton>
                    </div>
                  ),
                )}
                {adding && form ? (
                  <ClassForm
                    form={form}
                    saving={saving}
                    disabled={demo || !scheduleReady}
                    onChange={setForm}
                    onCancel={() => setForm(null)}
                    onSave={() => void saveForm()}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => openAdd(weekday)}
                    className="rounded-md border border-border px-3 py-1.5 text-sm font-semibold"
                  >
                    Add class
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {message ? <p className="text-sm">{message}</p> : null}
      </div>
    </div>
  );
}

function ClassForm({
  form,
  saving,
  disabled,
  onChange,
  onCancel,
  onSave,
}: {
  form: FormState;
  saving: boolean;
  disabled: boolean;
  onChange: (form: FormState) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const listed = TIME_OPTIONS.includes(form.start);
  return (
    <div className="flex flex-wrap items-end gap-2 rounded-lg bg-muted/50 p-3">
      <label className="text-xs">
        Start
        <select
          value={form.custom || !listed ? "__custom" : form.start}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "__custom") onChange({ ...form, custom: true });
            else onChange({ ...form, custom: false, start: value });
          }}
          className="mt-1 block rounded border border-border bg-white px-2 py-2 text-sm"
        >
          {TIME_OPTIONS.map((time) => (
            <option key={time} value={time}>
              {formatTime(time)}
            </option>
          ))}
          <option value="__custom">Type a time</option>
        </select>
      </label>
      {form.custom || !listed ? (
        <label className="text-xs">
          Time
          <input
            type="time"
            value={form.start}
            onChange={(event) => onChange({ ...form, start: event.target.value })}
            className="mt-1 block rounded border border-border bg-white px-2 py-2 text-sm"
          />
        </label>
      ) : null}
      <label className="text-xs">
        Hours
        <input
          type="number"
          min={0}
          max={8}
          value={form.hours}
          onChange={(event) => onChange({ ...form, hours: event.target.value })}
          className="mt-1 block w-20 rounded border border-border bg-white px-2 py-2 text-sm"
        />
      </label>
      <label className="text-xs">
        Minutes
        <input
          type="number"
          min={0}
          max={59}
          value={form.minutes}
          onChange={(event) => onChange({ ...form, minutes: event.target.value })}
          className="mt-1 block w-20 rounded border border-border bg-white px-2 py-2 text-sm"
        />
      </label>
      <button
        type="button"
        onClick={onSave}
        disabled={saving || disabled}
        className="rounded-md bg-gold px-3 py-2 text-sm font-bold text-ink disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save"}
      </button>
      <button type="button" onClick={onCancel} className="px-2 py-2 text-sm font-semibold">
        Cancel
      </button>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded p-1 text-foreground hover:bg-muted"
    >
      {children}
    </button>
  );
}
