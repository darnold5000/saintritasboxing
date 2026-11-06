"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  TRAINING_TYPES,
  TRAINING_TYPE_IDS,
  formatUsd,
  type CatalogOffering,
  type PackageKind,
  type TrainingTypeId,
} from "@/lib/catalog";

function dollars(cents: number) {
  return (cents / 100).toFixed(2);
}

function toCents(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

const KIND_LABEL: Record<PackageKind, string> = {
  single: "Single session",
  package: "Session package",
  subscription: "Monthly membership",
};

export function OfferingsAdmin({ offerings }: { offerings: CatalogOffering[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    trainingType: "private" as TrainingTypeId,
    kind: "package" as PackageKind,
    name: "",
    sessions: "5",
    price: "",
    description: "",
    published: true,
  });

  async function saveExisting(offering: CatalogOffering, form: FormData) {
    setError("");
    setNotice("");
    const priceCents = toCents(String(form.get("price") ?? ""));
    const sessionsRaw = String(form.get("sessions") ?? "").trim();
    const sessions = sessionsRaw ? Number(sessionsRaw) : null;
    if (priceCents === null) {
      setError("Enter a price of zero or more.");
      return;
    }
    if (offering.kind === "package" && (!sessions || sessions < 2)) {
      setError("A package needs at least 2 sessions.");
      return;
    }
    const res = await fetch("/api/admin/offerings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: offering.id,
        name: String(form.get("name") ?? ""),
        sessions: offering.kind === "package" ? sessions : null,
        priceCents,
        description: String(form.get("description") ?? ""),
        published: form.get("published") === "on",
      }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(body.error ?? "Could not save the package.");
      return;
    }
    setNotice("Package saved. The website and new checkouts use this price.");
    router.refresh();
  }

  async function addPackage(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    const priceCents = toCents(draft.price);
    if (priceCents === null) {
      setError("Enter a price of zero or more.");
      return;
    }
    const sessions = draft.kind === "package" ? Number(draft.sessions) : null;
    if (draft.kind === "package" && (!sessions || sessions < 2)) {
      setError("A package needs at least 2 sessions.");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/offerings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainingType: draft.trainingType,
          kind: draft.kind,
          name: draft.name,
          sessions,
          priceCents,
          description: draft.description,
          published: draft.published,
        }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Could not add the package.");
        return;
      }
      setDraft({
        trainingType: draft.trainingType,
        kind: "package",
        name: "",
        sessions: "5",
        price: "",
        description: "",
        published: true,
      });
      setNotice("Package added.");
      router.refresh();
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={(event) => void addPackage(event)} className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-heading text-2xl text-foreground">Add a package</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Training
            <select
              value={draft.trainingType}
              onChange={(event) =>
                setDraft({ ...draft, trainingType: event.target.value as TrainingTypeId })
              }
              className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2"
            >
              {TRAINING_TYPE_IDS.map((id) => (
                <option key={id} value={id}>
                  {TRAINING_TYPES[id].name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Type
            <select
              value={draft.kind}
              onChange={(event) => setDraft({ ...draft, kind: event.target.value as PackageKind })}
              className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2"
            >
              <option value="single">Single session</option>
              <option value="package">Session package</option>
              <option value="subscription">Monthly membership</option>
            </select>
          </label>
          <label className="text-sm">
            Name
            <input
              required
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="mt-1 w-full rounded-md border border-border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Price (USD)
            <input
              required
              inputMode="decimal"
              value={draft.price}
              onChange={(event) => setDraft({ ...draft, price: event.target.value })}
              placeholder="50.00"
              className="mt-1 w-full rounded-md border border-border px-3 py-2"
            />
          </label>
          {draft.kind === "package" ? (
            <label className="text-sm">
              Sessions
              <input
                required
                type="number"
                min={2}
                value={draft.sessions}
                onChange={(event) => setDraft({ ...draft, sessions: event.target.value })}
                className="mt-1 w-full rounded-md border border-border px-3 py-2"
              />
            </label>
          ) : null}
          <label className="text-sm sm:col-span-2">
            Description
            <textarea
              required
              rows={2}
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              className="mt-1 w-full rounded-md border border-border px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(event) => setDraft({ ...draft, published: event.target.checked })}
            />
            Show on the website
          </label>
        </div>
        <Button type="submit" disabled={adding} className="mt-4">
          {adding ? "Adding…" : "Add package"}
        </Button>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {notice ? <p className="text-sm text-foreground">{notice}</p> : null}

      {TRAINING_TYPE_IDS.map((typeId) => {
        const rows = offerings.filter((item) => item.trainingType === typeId);
        return (
          <section key={typeId}>
            <h2 className="font-heading text-2xl text-foreground">{TRAINING_TYPES[typeId].name}</h2>
            <div className="mt-3 space-y-3">
              {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No packages yet.</p>
              ) : null}
              {rows.map((offering) => (
                <form
                  key={offering.id}
                  onSubmit={(event) => {
                    event.preventDefault();
                    void saveExisting(offering, new FormData(event.currentTarget));
                  }}
                  className="rounded-xl border border-border bg-white p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {KIND_LABEL[offering.kind]} · {offering.published === false ? "Hidden" : "On the website"} ·{" "}
                    {formatUsd(offering.priceCents)}
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="text-sm">
                      Name
                      <input
                        name="name"
                        required
                        defaultValue={offering.name}
                        className="mt-1 w-full rounded-md border border-border px-3 py-2"
                      />
                    </label>
                    <label className="text-sm">
                      Price (USD)
                      <input
                        name="price"
                        required
                        inputMode="decimal"
                        defaultValue={dollars(offering.priceCents)}
                        className="mt-1 w-full rounded-md border border-border px-3 py-2"
                      />
                    </label>
                    {offering.kind === "package" ? (
                      <label className="text-sm">
                        Sessions
                        <input
                          name="sessions"
                          type="number"
                          min={2}
                          required
                          defaultValue={offering.sessions ?? 2}
                          className="mt-1 w-full rounded-md border border-border px-3 py-2"
                        />
                      </label>
                    ) : null}
                    <label className="text-sm sm:col-span-2">
                      Description
                      <textarea
                        name="description"
                        required
                        rows={2}
                        defaultValue={offering.description}
                        className="mt-1 w-full rounded-md border border-border px-3 py-2"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="published" defaultChecked={offering.published !== false} />
                      Show on the website
                    </label>
                  </div>
                  <Button type="submit" className="mt-3">
                    Save
                  </Button>
                </form>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
