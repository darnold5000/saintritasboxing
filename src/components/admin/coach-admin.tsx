"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CoachProfile } from "@/lib/data/coach";

export function CoachAdmin({ coach }: { coach: CoachProfile }) {
  const router = useRouter();
  const [name, setName] = useState(coach.name);
  const [roleTitle, setRoleTitle] = useState(coach.roleTitle);
  const [bio, setBio] = useState(coach.bio);
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [fileKey, setFileKey] = useState(0);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const preview = previewUrl || (removePhoto ? "" : coach.photoUrl);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const body = new FormData();
    body.set("name", name);
    body.set("roleTitle", roleTitle);
    body.set("bio", bio);
    body.set("removePhoto", removePhoto ? "true" : "false");
    if (photo) body.set("photo", photo);
    const res = await fetch("/api/admin/coach", { method: "PUT", body });
    const payload = (await res.json()) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setMessage(payload.error ?? "Could not save the coach profile.");
      return;
    }
    setPhoto(null);
    setPreviewUrl(null);
    setFileKey((value) => value + 1);
    setMessage("About page saved.");
    router.refresh();
  }

  return (
    <form onSubmit={(event) => void save(event)} className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="rounded-xl border border-border bg-white p-5">
        <label className="block text-sm">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
        <label className="mt-4 block text-sm">
          Title
          <input
            value={roleTitle}
            onChange={(event) => setRoleTitle(event.target.value)}
            placeholder="Owner & coach"
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
        <label className="mt-4 block text-sm">
          Bio
          <textarea
            value={bio}
            rows={16}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Coach bio"
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          A blank line between paragraphs starts a new paragraph. The all-caps first line shows
          as the tagline.
        </p>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save about page"}
        </button>
        {message ? <p className="mt-3 text-sm">{message}</p> : null}
      </div>
      <div className="rounded-xl border border-border bg-white p-5">
        <p className="text-sm font-semibold">Photo</p>
        {preview ? (
          // Blob previews and saved photos are staff-only previews.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="mt-3 aspect-[4/5] w-full rounded-lg object-cover" />
        ) : (
          <div className="mt-3 flex aspect-[4/5] items-center justify-center rounded-lg border border-dashed border-border bg-muted text-center text-sm text-muted-foreground">
            Photo coming soon
          </div>
        )}
        <label className="mt-4 block text-sm">
          Replace photo
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            key={fileKey}
            onChange={(event) => {
              const next = event.target.files?.[0] ?? null;
              setPhoto(next);
              setPreviewUrl(next ? URL.createObjectURL(next) : null);
              if (next) setRemovePhoto(false);
            }}
            className="mt-1 block w-full text-sm"
          />
        </label>
        {coach.photoUrl || photo ? (
          <button
            type="button"
            onClick={() => {
              setPhoto(null);
              setPreviewUrl(null);
              setRemovePhoto(true);
              setFileKey((value) => value + 1);
            }}
            className="mt-3 text-sm font-semibold text-red-700"
          >
            Remove photo
          </button>
        ) : null}
        <p className="mt-3 text-xs text-muted-foreground">JPG, PNG, or WebP. 5 MB max.</p>
      </div>
    </form>
  );
}
