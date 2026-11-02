"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GalleryImage } from "@/lib/data/gallery";

export function GalleryAdmin({ images }: { images: GalleryImage[] }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function addImage(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setMessage("Choose an image to add.");
      return;
    }
    setSaving(true);
    setMessage("");
    const body = new FormData();
    body.set("image", file);
    body.set("caption", caption);
    const res = await fetch("/api/admin/gallery", { method: "POST", body });
    const payload = (await res.json()) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setMessage(payload.error ?? "Could not add the image.");
      return;
    }
    setFile(null);
    setFileKey((value) => value + 1);
    setCaption("");
    setMessage("Image added.");
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-8">
      <form onSubmit={(event) => void addImage(event)} className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-heading text-xl">Add image</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Caption is optional. Images show on the public Gallery page.
        </p>
        <label className="mt-4 block text-sm">
          Image
          <input
            key={fileKey}
            type="file"
            required
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm"
          />
        </label>
        <label className="mt-4 block text-sm">
          Caption <span className="text-muted-foreground">(optional)</span>
          <input
            value={caption}
            maxLength={240}
            onChange={(event) => setCaption(event.target.value)}
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Adding…" : "Add image"}
        </button>
        {message ? <p className="mt-3 text-sm">{message}</p> : null}
      </form>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">No gallery images yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <GalleryCard key={image.id} image={image} />
          ))}
        </ul>
      )}
    </div>
  );
}

function GalleryCard({ image }: { image: GalleryImage }) {
  const router = useRouter();
  const [caption, setCaption] = useState(image.caption ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveCaption() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: image.id, caption }),
    });
    const payload = (await res.json()) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setMessage(payload.error ?? "Could not save the caption.");
      return;
    }
    setMessage("Caption saved.");
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("Delete this gallery image?")) return;
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/admin/gallery?id=${image.id}`, { method: "DELETE" });
    const payload = (await res.json()) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setMessage(payload.error ?? "Could not delete the image.");
      return;
    }
    router.refresh();
  }

  return (
    <li className="overflow-hidden rounded-xl border border-border bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
      <div className="space-y-3 p-4">
        <label className="block text-sm">
          Caption <span className="text-muted-foreground">(optional)</span>
          <input
            value={caption}
            maxLength={240}
            onChange={(event) => setCaption(event.target.value)}
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void saveCaption()}
            disabled={saving}
            className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            Save caption
          </button>
          <button
            type="button"
            onClick={() => void remove()}
            disabled={saving}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-red-700 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
        {message ? <p className="text-sm">{message}</p> : null}
      </div>
    </li>
  );
}
