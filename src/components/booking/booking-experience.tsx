"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DateStrip } from "@/components/booking/date-strip";
import { TimeGrid } from "@/components/booking/time-grid";
import { Button } from "@/components/ui/button";
import {
  TRAINING_TYPES,
  formatUsd,
  packageOfferingsForType,
  singleOfferingForType,
  type TrainingTypeId,
} from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { formatLongDate, formatTime, startOfWeek, todayISO } from "@/lib/dates";
import { validateCustomerInput } from "@/lib/booking-rules";

type AvailabilityResponse = {
  dates: string[];
  times: string[];
  demo: boolean;
};

type CreditLookup = {
  hasCredit: boolean;
  remaining: number | null;
  unlimitedActive: boolean;
  configured: boolean;
};

type PaymentMethod = "use_credit" | "pay_single" | "buy_package";

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
  const singleOffering = singleOfferingForType(trainingType);
  const packages = packageOfferingsForType(trainingType);
  const verifyToken = params.get("token");

  const [weekISO, setWeekISO] = useState(startOfWeek(today));
  const [date, setDate] = useState<string | null>(params.get("date") ?? initialDates[0] ?? null);
  const [time, setTime] = useState<string | null>(params.get("time"));
  const [times, setTimes] = useState<string[]>([]);
  const available = useMemo(() => new Set(initialDates), [initialDates]);
  const [step, setStep] = useState<"schedule" | "details">(
    verifyToken && params.get("date") && params.get("time") ? "details" : "schedule",
  );
  const [customer, setCustomer] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [creditLookup, setCreditLookup] = useState<CreditLookup | null>(null);
  const [creditLookupLoading, setCreditLookupLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    verifyToken ? "use_credit" : "pay_single",
  );
  const [packageOfferingId, setPackageOfferingId] = useState(
    packages[0]?.id ?? "",
  );

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim());
  const creditLookupDisplay = emailValid ? creditLookup : null;
  const creditLookupBusy = emailValid && creditLookupLoading;
  const typeMeta = TRAINING_TYPES[trainingType];
  const scheduleReady = Boolean(date && time);
  const verifyCreditBanner = verifyToken
    ? "Email verified — confirm below to book with your credit."
    : "";

  const creditOptionDetail = useMemo(() => {
    if (!emailValid) {
      return "Package credits stay on the email you used at checkout. Enter that email above to see your balance.";
    }
    if (creditLookupBusy && !creditLookup) {
      return "Checking credits for this email…";
    }
    if (creditLookup && !creditLookup.configured) {
      return "Live credit lookup needs Supabase configured. You can still try this option once the site is connected.";
    }
    if (creditLookupDisplay?.hasCredit) {
      if (creditLookupDisplay.unlimitedActive) {
        return "Monthly unlimited — this session is included.";
      }
      const n = creditLookupDisplay.remaining ?? 0;
      return `${n} session${n === 1 ? "" : "s"} left for ${typeMeta.shortName} on this email.`;
    }
    if (creditLookup) {
      return "No remaining credits for this training type on this email. Pay for this session or buy a package below.";
    }
    return "Checking credits for this email…";
  }, [
    creditLookup,
    creditLookupDisplay,
    creditLookupBusy,
    emailValid,
    typeMeta.shortName,
  ]);

  useEffect(() => {
    const first = date ?? initialDates[0];
    if (first) void loadTimes(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!emailValid) return;
    const email = customer.email.trim();
    let cancelled = false;
    const handle = setTimeout(() => {
      setCreditLookupLoading(true);
      void fetch("/api/credits/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, trainingType }),
      })
        .then((res) => res.json())
        .then((body: CreditLookup) => {
          if (cancelled) return;
          setCreditLookup(body);
          if (body.hasCredit && !verifyToken) {
            setPaymentMethod("use_credit");
          }
        })
        .catch(() => {
          if (!cancelled) setCreditLookup(null);
        })
        .finally(() => {
          if (!cancelled) setCreditLookupLoading(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [customer.email, trainingType, verifyToken, emailValid]);

  function setQueryType(next: TrainingTypeId) {
    const search = new URLSearchParams(params.toString());
    search.set("type", next);
    search.delete("token");
    router.replace(`/book?${search.toString()}`, { scroll: false });
  }

  function selectType(next: TrainingTypeId) {
    setDate(null);
    setTime(null);
    setTimes([]);
    setStep("schedule");
    setPaymentMethod("pay_single");
    setPackageOfferingId(packageOfferingsForType(next)[0]?.id ?? "");
    setQueryType(next);
  }

  async function loadTimes(nextDate: string) {
    const res = await fetch(`/api/availability?date=${nextDate}`);
    const body = (await res.json()) as AvailabilityResponse;
    setTimes(body.times ?? []);
    if (time && !(body.times ?? []).includes(time)) setTime(null);
  }

  async function selectDate(iso: string) {
    setDate(iso);
    await loadTimes(iso);
  }

  async function continueToDetails() {
    setServerError("");
    setInfoMessage("");
    if (!scheduleReady) {
      setServerError("Choose a date and time to continue.");
      return;
    }
    setStep("details");
  }

  function checkoutOfferingId(): string | null {
    if (paymentMethod === "pay_single") return singleOffering?.id ?? null;
    if (paymentMethod === "buy_package") return packageOfferingId || null;
    return null;
  }

  async function submit() {
    setServerError("");
    setInfoMessage("");
    if (!scheduleReady) {
      setServerError("Choose a date and time.");
      return;
    }

    const nextErrors = validateCustomerInput({ ...customer, trainingType });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (
      paymentMethod === "use_credit" &&
      emailValid &&
      creditLookup?.configured &&
      !creditLookup.hasCredit
    ) {
      setServerError(
        "No session credits on this email for this training type. Pay for this session or buy a package.",
      );
      return;
    }

    setSubmitting(true);
    try {
      if (paymentMethod === "use_credit") {
        if (verifyToken) {
          const res = await fetch("/api/credits/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: verifyToken,
              trainingType,
              sessionDate: date,
              startTime: time,
              customer,
            }),
          });
          const body = (await res.json()) as { error?: string; ok?: boolean };
          if (!res.ok) {
            setServerError(body.error ?? "Could not book with credit.");
            return;
          }
          router.push("/book/success?booked=credit");
          return;
        }

        const res = await fetch("/api/book/credit-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trainingType,
            sessionDate: date,
            startTime: time,
            customer,
          }),
        });
        const body = (await res.json()) as {
          error?: string;
          message?: string;
          confirmUrl?: string;
          demo?: boolean;
        };
        if (!res.ok) {
          setServerError(body.error ?? "Could not start credit booking.");
          return;
        }
        setInfoMessage(
          body.message ??
            (body.demo
              ? "Demo mode — configure Supabase and Resend for live credit confirmation."
              : "Check your email to confirm."),
        );
        if (body.confirmUrl) setInfoMessage(`${body.message}\n${body.confirmUrl}`);
        return;
      }

      const offeringId = checkoutOfferingId();
      if (!offeringId) {
        setServerError("Choose a payment option.");
        return;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offeringId,
          sessionDate: date,
          startTime: time,
          customer,
        }),
      });
      const body = (await res.json()) as { error?: string; url?: string; demo?: boolean; message?: string };
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

  const summaryPrice =
    paymentMethod === "use_credit"
      ? "1 session credit"
      : paymentMethod === "pay_single"
        ? formatUsd(singleOffering?.priceCents ?? 0)
        : formatUsd(
            packages.find((item) => item.id === packageOfferingId)?.priceCents ?? 0,
          );

  const submitLabel =
    paymentMethod === "use_credit"
      ? verifyToken
        ? "Confirm booking with credit"
        : "Email me to confirm with credit"
      : "Continue to payment";

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
            Step 2 — Select date
          </p>
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
            Step 3 — Available times
          </p>
          <div className="mt-4">
            <TimeGrid times={times} selected={time} onSelect={setTime} />
          </div>
        </section>

        {step === "details" ? (
          <section className="rounded-2xl border border-white/10 bg-surface p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Step 4 — Your information
            </p>
            <div className="mt-4 grid gap-3">
              <Field
                label="Full name"
                value={customer.fullName}
                error={errors.fullName}
                onChange={(value) => setCustomer({ ...customer, fullName: value })}
              />
              <Field
                label="Email (required)"
                hint="Use the same address you used when you bought a package — credits and purchase history stay on that email."
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

            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                How would you like to pay?
              </p>
              <div className="mt-4 space-y-2">
                <PaymentOption
                  checked={paymentMethod === "use_credit"}
                  onChange={() => setPaymentMethod("use_credit")}
                  title="Use session credit"
                  detail={creditOptionDetail}
                />
                <PaymentOption
                  checked={paymentMethod === "pay_single"}
                  onChange={() => setPaymentMethod("pay_single")}
                  title="Pay for this session"
                  detail={`${formatUsd(singleOffering?.priceCents ?? 0)} — card checkout`}
                />
                <PaymentOption
                  checked={paymentMethod === "buy_package"}
                  onChange={() => setPaymentMethod("buy_package")}
                  title="Buy a package & book this session"
                  detail="Pay for a package now. One session is used for this appointment; the rest stay on your account."
                />
              </div>
              {paymentMethod === "buy_package" ? (
                <div className="mt-3 space-y-2">
                  {packages.map((pkg) => (
                    <label
                      key={pkg.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 ${
                        packageOfferingId === pkg.id
                          ? "border-brand bg-brand/20"
                          : "border-white/10"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm text-white">
                        <input
                          type="radio"
                          name="package"
                          checked={packageOfferingId === pkg.id}
                          onChange={() => setPackageOfferingId(pkg.id)}
                        />
                        {pkg.name}
                      </span>
                      <span className="font-heading text-gold">{formatUsd(pkg.priceCents)}</span>
                    </label>
                  ))}
                </div>
              ) : null}
              {paymentMethod === "use_credit" && !verifyToken ? (
                <p className="mt-3 text-xs text-white/60">
                  We&apos;ll email you a secure link to confirm this booking with your credit.
                </p>
              ) : null}
            </div>

            {(infoMessage || verifyCreditBanner) ? (
              <p className="mt-4 whitespace-pre-wrap text-sm text-gold">
                {infoMessage || verifyCreditBanner}
              </p>
            ) : null}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" onClick={() => setStep("schedule")}>
                Back
              </Button>
              <Button type="button" onClick={() => void submit()} disabled={submitting}>
                {submitting ? "Working…" : submitLabel}
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
          <Row label="Date" value={date ? formatLongDate(date) : "Select a date"} />
          <Row label="Time" value={time ? formatTime(time) : "Select a time"} />
          <Row label="Duration" value={`${SITE.defaultSessionDurationMinutes} minutes`} />
          <Row label="Location" value={SITE.address.full} />
          <Row label="Payment" value={summaryPrice} />
        </dl>
        {demo ? (
          <p className="mt-4 rounded-md border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold">
            Sample availability until gym hours and payments are configured.
          </p>
        ) : null}
        {serverError ? (
          <p className="mt-4 text-sm text-red-300" role="alert">
            {serverError}
          </p>
        ) : null}
        {step === "schedule" ? (
          <div className="mt-6">
            <Button className="w-full" onClick={() => void continueToDetails()} disabled={!scheduleReady}>
              Continue
            </Button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function PaymentOption({
  checked,
  onChange,
  title,
  detail,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  detail: string;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
        checked ? "border-brand bg-brand/25" : "border-white/10 bg-ink"
      }`}
    >
      <input type="radio" name="payment" checked={checked} onChange={onChange} className="mt-1" />
      <span>
        <span className="block font-semibold text-white">{title}</span>
        <span className="mt-1 block text-xs text-white/65">{detail}</span>
      </span>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  type?: string;
}) {
  return (
    <label className="text-sm text-white/80">
      {label}
      <input
        type={type}
        required={type === "email"}
        autoComplete={type === "email" ? "email" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-white/15 bg-ink px-3 py-2 text-white"
      />
      {hint ? <span className="mt-1 block text-xs text-white/55">{hint}</span> : null}
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
