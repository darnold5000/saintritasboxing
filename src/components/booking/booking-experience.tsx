"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DateStrip } from "@/components/booking/date-strip";
import { TimeGrid } from "@/components/booking/time-grid";
import { Button } from "@/components/ui/button";
import {
  OFFERINGS,
  TRAINING_TYPES,
  formatUsd,
  offeringsForType,
  packageSavings,
  type TrainingTypeId,
} from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { formatLongDate, formatTime, startOfWeek, todayISO } from "@/lib/dates";
import { firstSessionRequired, validateCustomerInput } from "@/lib/booking-rules";

type AvailabilityResponse = {
  dates: string[];
  times: string[];
  demo: boolean;
  durationMinutes: number;
};

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  partnerName: "",
  isMinor: false,
  guardianName: "",
  guardianEmail: "",
  guardianPhone: "",
  notes: "",
};

export function BookingExperience({
  initialDates,
  demo,
}: {
  initialDates: string[];
  demo: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const today = todayISO();

  const typeParam = params.get("type");
  const trainingType: TrainingTypeId = typeParam === "partner" ? "partner" : "private";
  const offerings = offeringsForType(trainingType);
  const offeringId = params.get("offering") ?? offerings[0]?.id ?? "private-single";
  const offering = OFFERINGS.find((item) => item.id === offeringId) ?? offerings[0];

  const [weekISO, setWeekISO] = useState(startOfWeek(today));
  const [date, setDate] = useState<string | null>(initialDates[0] ?? null);
  const [time, setTime] = useState<string | null>(null);
  const [times, setTimes] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState(new Set(initialDates));
  const [step, setStep] = useState<"schedule" | "details">("schedule");
  const [customer, setCustomer] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const available = useMemo(() => availableDates, [availableDates]);

  useEffect(() => {
    const first = initialDates[0];
    if (first) void loadTimes(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setQuery(next: Record<string, string | null>) {
    const search = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) search.set(key, value);
      else search.delete(key);
    }
    router.replace(`/book?${search.toString()}`, { scroll: false });
  }

  async function loadTimes(nextDate: string) {
    const res = await fetch(`/api/availability?date=${nextDate}`);
    const body = (await res.json()) as AvailabilityResponse;
    setTimes(body.times ?? []);
    setTime(null);
  }

  async function refreshDates() {
    const res = await fetch("/api/availability");
    const body = (await res.json()) as AvailabilityResponse;
    setAvailableDates(new Set(body.dates ?? []));
  }

  function selectType(next: TrainingTypeId) {
    const first = offeringsForType(next)[0];
    setDate(null);
    setTime(null);
    setTimes([]);
    setStep("schedule");
    setQuery({ type: next, offering: first?.id ?? null });
  }

  function selectOffering(id: string) {
    setTime(null);
    setStep("schedule");
    setQuery({ type: trainingType, offering: id });
  }

  async function selectDate(iso: string) {
    setDate(iso);
    await loadTimes(iso);
  }

  const needsSchedule = offering ? firstSessionRequired(offering) : true;
  const scheduleReady = Boolean(date && time);
  const canContinue = offering && (!needsSchedule || scheduleReady);

  async function continueToDetails() {
    setServerError("");
    if (!canContinue) {
      setServerError("Choose a date and time to continue.");
      return;
    }
    await refreshDates();
    setStep("details");
  }

  async function submit() {
    if (!offering) return;
    const nextErrors = validateCustomerInput({
      ...customer,
      trainingType,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setServerError("");
    try {
      const creditToken = params.get("token");
      const endpoint = creditToken ? "/api/credits/verify" : "/api/checkout";
      const payload = creditToken
        ? {
            token: creditToken,
            trainingType,
            sessionDate: date,
            startTime: time,
            partnerName: customer.partnerName,
            notes: customer.notes,
          }
        : {
            offeringId: offering.id,
            sessionDate: date,
            startTime: time,
            customer,
          };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { error?: string; url?: string; demo?: boolean };
      if (!res.ok) {
        setServerError(body.error ?? "Could not start checkout.");
        return;
      }
      if (body.url) {
        window.location.assign(body.url);
        return;
      }
      if (body.demo) {
        router.push("/book/success?demo=1");
        return;
      }
      setServerError("Checkout did not return a payment URL.");
    } catch {
      setServerError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const savings = offering ? packageSavings(offering) : null;
  const typeMeta = TRAINING_TYPES[trainingType];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-white/10 bg-surface p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Step 1 — Choose training
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.values(TRAINING_TYPES).map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => selectType(type.id)}
                className={`rounded-xl border p-4 text-left ${
                  trainingType === type.id
                    ? "border-brand bg-brand/30"
                    : "border-white/10 bg-ink"
                }`}
              >
                <p className="font-heading text-lg text-white">{type.shortName}</p>
                <p className="mt-1 text-xs text-white/65">{type.summary}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-surface p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Step 2 — Session or package
          </p>
          <div className="mt-4 grid gap-2">
            {offerings.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectOffering(item.id)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left ${
                  offering?.id === item.id
                    ? "border-brand bg-brand/30"
                    : "border-white/10 bg-ink"
                }`}
              >
                <span>
                  <span className="block font-semibold text-white">{item.name}</span>
                  {item.kind === "subscription" ? (
                    <span className="text-xs text-gold">Recurring monthly</span>
                  ) : null}
                </span>
                <span className="font-heading text-xl text-gold">
                  {formatUsd(item.priceCents)}
                  {item.interval === "month" ? "/mo" : ""}
                </span>
              </button>
            ))}
          </div>
          {trainingType === "partner" ? (
            <p className="mt-3 text-xs text-white/60">
              Partner prices are the TOTAL for two participants, not per person.
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-white/10 bg-surface p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Step 3 — Select date
          </p>
          {!needsSchedule ? (
            <p className="mt-3 text-sm text-white/70">
              You can buy this package now and schedule sessions after payment, or pick a
              first session below.
            </p>
          ) : null}
          <div className="mt-4">
            <DateStrip
              weekStart={weekISO}
              selected={date}
              available={available}
              onSelect={(iso) => void selectDate(iso)}
              onWeekChange={setWeekISO}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-surface p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Step 4 — Available times
          </p>
          <div className="mt-4">
            <TimeGrid times={times} selected={time} onSelect={setTime} />
          </div>
        </section>

        {step === "details" ? (
          <section className="rounded-2xl border border-white/10 bg-surface p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Your information
            </p>
            <div className="mt-4 grid gap-3">
              <Field
                label="Full name"
                value={customer.fullName}
                error={errors.fullName}
                onChange={(value) => setCustomer({ ...customer, fullName: value })}
              />
              <Field
                label="Email"
                type="email"
                value={customer.email}
                error={errors.email}
                onChange={(value) => setCustomer({ ...customer, email: value })}
              />
              <Field
                label="Phone"
                type="tel"
                value={customer.phone}
                error={errors.phone}
                onChange={(value) => setCustomer({ ...customer, phone: value })}
              />
              {trainingType === "partner" ? (
                <Field
                  label="Second participant name"
                  value={customer.partnerName}
                  error={errors.partnerName}
                  onChange={(value) => setCustomer({ ...customer, partnerName: value })}
                />
              ) : null}
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={customer.isMinor}
                  onChange={(event) =>
                    setCustomer({ ...customer, isMinor: event.target.checked })
                  }
                />
                This session is for a minor
              </label>
              {customer.isMinor ? (
                <>
                  <Field
                    label="Parent / guardian name"
                    value={customer.guardianName}
                    error={errors.guardianName}
                    onChange={(value) => setCustomer({ ...customer, guardianName: value })}
                  />
                  <Field
                    label="Parent / guardian email"
                    type="email"
                    value={customer.guardianEmail}
                    error={errors.guardianEmail}
                    onChange={(value) => setCustomer({ ...customer, guardianEmail: value })}
                  />
                  <Field
                    label="Parent / guardian phone"
                    type="tel"
                    value={customer.guardianPhone}
                    error={errors.guardianPhone || errors.guardianContact}
                    onChange={(value) => setCustomer({ ...customer, guardianPhone: value })}
                  />
                </>
              ) : null}
              <label className="text-sm text-white/80">
                Notes
                <textarea
                  className="mt-1 w-full rounded-md border border-white/15 bg-ink px-3 py-2 text-white"
                  rows={3}
                  value={customer.notes}
                  onChange={(event) => setCustomer({ ...customer, notes: event.target.value })}
                />
              </label>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" onClick={() => setStep("schedule")}>
                Back
              </Button>
              <Button type="button" onClick={() => void submit()} disabled={submitting}>
                {submitting ? "Starting checkout…" : "Continue to book"}
              </Button>
            </div>
          </section>
        ) : null}
      </div>

      <aside className="h-fit rounded-2xl border border-white/10 bg-ink p-5 lg:sticky lg:top-24">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
          Booking summary
        </p>
        <h2 className="mt-2 font-heading text-2xl text-white">{typeMeta.name}</h2>
        <dl className="mt-4 space-y-2 text-sm text-white/75">
          <Row label="Selection" value={offering?.name ?? "—"} />
          <Row
            label="Date"
            value={date ? formatLongDate(date) : needsSchedule ? "Select a date" : "Schedule after purchase"}
          />
          <Row label="Time" value={time ? formatTime(time) : "Select a time"} />
          <Row label="Duration" value={`${SITE.defaultSessionDurationMinutes} minutes`} />
          <Row label="Location" value={SITE.address.full} />
          <Row
            label="Price"
            value={`${formatUsd(offering?.priceCents ?? 0)}${offering?.interval === "month" ? "/month" : ""}`}
          />
        </dl>
        {savings ? (
          <p className="mt-3 text-sm font-semibold text-gold">
            Save {formatUsd(savings.savedCents)} versus {offering?.sessions} single sessions.
          </p>
        ) : null}
        {offering?.kind === "subscription" ? (
          <p className="mt-3 text-xs text-white/60">
            Recurring monthly. Cancel or manage through the Stripe customer portal after
            checkout.
          </p>
        ) : null}
        {demo ? (
          <p className="mt-4 rounded-md border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold">
            Sample availability until gym hours are confirmed and Stripe/Supabase are connected.
          </p>
        ) : null}
        {serverError ? (
          <p className="mt-4 text-sm text-red-300" role="alert">
            {serverError}
          </p>
        ) : null}
        {step === "schedule" ? (
          <div className="mt-6">
            <Button className="w-full" onClick={() => void continueToDetails()} disabled={!canContinue}>
              Continue to book
            </Button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <label className="text-sm text-white/80">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-white/15 bg-ink px-3 py-2 text-white"
      />
      {error ? <span className="mt-1 block text-xs text-red-300">{error}</span> : null}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-white/50">{label}</dt>
      <dd className="text-right text-white">{value}</dd>
    </div>
  );
}
