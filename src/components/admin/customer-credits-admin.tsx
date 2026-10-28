"use client";

import { useState } from "react";

type Purchase = {
  id: string;
  name: string;
  training_type: string;
  sessions_total: number;
  sessions_remaining: number;
  kind: string;
};

export function CustomerCreditsAdmin({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const [open, setOpen] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");
    const res = await fetch(`/api/admin/customers/credits?customerId=${customerId}`);
    const body = (await res.json()) as { purchases?: Purchase[]; error?: string };
    setLoading(false);
    if (!res.ok) {
      setMessage(body.error ?? "Could not load packages.");
      return;
    }
    setPurchases(body.purchases ?? []);
    setOpen(true);
  }

  async function adjust(purchaseId: string, delta: number) {
    if (!reason.trim()) {
      setMessage("Add a reason above (e.g. cancelled session refund), then try again.");
      return;
    }
    setMessage("");
    const res = await fetch("/api/admin/customers/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purchaseId, delta, reason: reason.trim() }),
    });
    const body = (await res.json()) as { error?: string; sessionsRemaining?: number };
    if (!res.ok) {
      setMessage(body.error ?? "Adjustment failed.");
      return;
    }
    setMessage(`Updated. ${body.sessionsRemaining ?? ""} sessions remaining on that package.`);
    setReason("");
    await load();
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        className="text-xs font-semibold text-brand underline"
        onClick={() => void load()}
      >
        {open ? "Refresh credits" : "Manage credits"}
      </button>
      {loading ? <p className="mt-1 text-xs text-muted-foreground">Loading…</p> : null}
      {open ? (
        <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {customerName}
          </p>
          {purchases.length === 0 ? (
            <p className="mt-2 text-sm">No paid packages with session credits.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {purchases.map((purchase) => (
                <li key={purchase.id} className="rounded-md bg-white p-2 text-sm">
                  <p className="font-medium">{purchase.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {purchase.sessions_remaining} of {purchase.sessions_total} remaining
                  </p>
                  {purchase.kind !== "subscription" ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded border border-border px-2 py-1 text-xs font-semibold"
                        onClick={() => void adjust(purchase.id, 1)}
                      >
                        +1 credit
                      </button>
                      <button
                        type="button"
                        className="rounded border border-border px-2 py-1 text-xs font-semibold"
                        onClick={() => void adjust(purchase.id, -1)}
                      >
                        −1 credit
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          <label className="mt-3 block text-xs">
            Reason for next adjustment
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. Client cancelled — refund 1 session"
              className="mt-1 w-full rounded border border-border px-2 py-1.5 text-sm"
            />
          </label>

          {message ? <p className="mt-2 text-xs">{message}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
