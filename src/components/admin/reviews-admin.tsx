"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReviewRecord } from "@/lib/data/reviews";

type Draft = {
  reviewerName: string;
  reviewerDescription: string;
  rating: string;
  reviewText: string;
  published: boolean;
  displayOrder: string;
};

const EMPTY: Draft = {
  reviewerName: "",
  reviewerDescription: "",
  rating: "5",
  reviewText: "",
  published: true,
  displayOrder: "0",
};

function fromReview(review: ReviewRecord): Draft {
  return {
    reviewerName: review.reviewer_name,
    reviewerDescription: review.reviewer_description ?? "",
    rating: String(review.rating),
    reviewText: review.review_text,
    published: review.published,
    displayOrder: String(review.display_order),
  };
}

function payload(draft: Draft) {
  return {
    reviewerName: draft.reviewerName,
    reviewerDescription: draft.reviewerDescription,
    rating: Number(draft.rating),
    reviewText: draft.reviewText,
    published: draft.published,
    displayOrder: Number(draft.displayOrder) || 0,
  };
}

export function ReviewsAdmin({ reviews }: { reviews: ReviewRecord[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState(EMPTY);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload(draft)),
    });
    const body = (await res.json()) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setMessage(body.error ?? "Could not save review.");
      return;
    }
    setDraft(EMPTY);
    setMessage("Review added.");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={(event) => void create(event)} className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-heading text-xl">Add review</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Published reviews appear on the home page. Use the source line for things like
          &quot;Client · Facebook · October 2026&quot;.
        </p>
        <ReviewFields draft={draft} onChange={setDraft} idPrefix="new" />
        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add review"}
        </button>
        {message ? <p className="mt-3 text-sm">{message}</p> : null}
      </form>

      <div>
        <h2 className="font-heading text-xl">Current reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No reviews stored yet.</p>
        ) : (
          <div className="mt-4 grid gap-4">
            {reviews.map((review) => (
              <ReviewEditor key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewEditor({ review }: { review: ReviewRecord }) {
  const router = useRouter();
  const [draft, setDraft] = useState(fromReview(review));
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: review.id, ...payload(draft) }),
    });
    const body = (await res.json()) as { error?: string };
    setSaving(false);
    setMessage(res.ok ? "Saved." : (body.error ?? "Could not update review."));
    if (res.ok) router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Delete the review from ${review.reviewer_name}?`)) return;
    const res = await fetch(`/api/admin/reviews?id=${review.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      setMessage(body.error ?? "Could not delete review.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={(event) => void save(event)} className="rounded-xl border border-border bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          {review.published ? "Published" : "Hidden"}
        </p>
        <button type="button" onClick={() => void remove()} className="text-xs font-semibold text-red-700 underline">
          Delete
        </button>
      </div>
      <ReviewFields draft={draft} onChange={setDraft} idPrefix={review.id} />
      <button
        type="submit"
        disabled={saving}
        className="mt-4 rounded-md border border-border px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
      {message ? <p className="mt-3 text-sm">{message}</p> : null}
    </form>
  );
}

function ReviewFields({
  draft,
  onChange,
  idPrefix,
}: {
  draft: Draft;
  onChange: (draft: Draft) => void;
  idPrefix: string;
}) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="text-sm">
        Reviewer name
        <input
          id={`${idPrefix}-name`}
          required
          value={draft.reviewerName}
          onChange={(event) => onChange({ ...draft, reviewerName: event.target.value })}
          className="mt-1 w-full rounded-md border border-border px-3 py-2"
        />
      </label>
      <label className="text-sm">
        Source line
        <input
          id={`${idPrefix}-desc`}
          value={draft.reviewerDescription}
          placeholder="Client · Facebook · October 2026"
          onChange={(event) => onChange({ ...draft, reviewerDescription: event.target.value })}
          className="mt-1 w-full rounded-md border border-border px-3 py-2"
        />
      </label>
      <label className="text-sm">
        Stars
        <select
          id={`${idPrefix}-rating`}
          value={draft.rating}
          onChange={(event) => onChange({ ...draft, rating: event.target.value })}
          className="mt-1 w-full rounded-md border border-border px-3 py-2"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Display order
        <input
          id={`${idPrefix}-order`}
          type="number"
          min={0}
          value={draft.displayOrder}
          onChange={(event) => onChange({ ...draft, displayOrder: event.target.value })}
          className="mt-1 w-full rounded-md border border-border px-3 py-2"
        />
      </label>
      <label className="text-sm sm:col-span-2">
        Review
        <textarea
          id={`${idPrefix}-text`}
          required
          rows={4}
          value={draft.reviewText}
          onChange={(event) => onChange({ ...draft, reviewText: event.target.value })}
          className="mt-1 w-full rounded-md border border-border px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          checked={draft.published}
          onChange={(event) => onChange({ ...draft, published: event.target.checked })}
        />
        Show on the home page
      </label>
    </div>
  );
}
