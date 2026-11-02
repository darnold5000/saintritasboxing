import { mediaPublicUrl, removeMediaFile, uploadMediaFile } from "@/lib/data/media-files";
import type { ImageKind } from "@/lib/images";
import { TABLES } from "@/lib/tables";
import { createServiceClient } from "@/lib/supabase/server";

export type CoachProfile = {
  name: string;
  roleTitle: string;
  bio: string;
  photoPath: string | null;
  photoUrl: string | null;
};

export const EMPTY_COACH: CoachProfile = {
  name: "",
  roleTitle: "",
  bio: "",
  photoPath: null,
  photoUrl: null,
};

export async function getCoachProfile(): Promise<CoachProfile> {
  const db = createServiceClient();
  const { data, error } = await db
    .from(TABLES.coachProfile)
    .select("name, role_title, bio, photo_path")
    .eq("id", "coach")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return EMPTY_COACH;
  const photoPath = data.photo_path ? String(data.photo_path) : null;
  return {
    name: String(data.name ?? ""),
    roleTitle: String(data.role_title ?? ""),
    bio: String(data.bio ?? ""),
    photoPath,
    photoUrl: mediaPublicUrl(photoPath),
  };
}

export async function saveCoachProfile(input: {
  name: string;
  roleTitle: string;
  bio: string;
  photo?: { bytes: Uint8Array; kind: ImageKind; contentType: string } | null;
  removePhoto?: boolean;
}) {
  const current = await getCoachProfile();
  let photoPath = current.photoPath;
  let uploadedPath: string | null = null;

  if (input.photo) {
    uploadedPath = `coach/${crypto.randomUUID()}.${input.photo.kind}`;
    await uploadMediaFile(uploadedPath, input.photo.bytes, input.photo.contentType);
    photoPath = uploadedPath;
  } else if (input.removePhoto) {
    photoPath = null;
  }

  const db = createServiceClient();
  const { error } = await db.from(TABLES.coachProfile).upsert({
    id: "coach",
    name: input.name.trim(),
    role_title: input.roleTitle.trim(),
    bio: input.bio.trim(),
    photo_path: photoPath,
    photo_url: mediaPublicUrl(photoPath),
    updated_at: new Date().toISOString(),
  });
  if (error) {
    if (uploadedPath) await removeMediaFile(uploadedPath);
    throw new Error(error.message);
  }

  if (uploadedPath && current.photoPath && current.photoPath !== uploadedPath) {
    await removeMediaFile(current.photoPath);
  }
  if (input.removePhoto && !input.photo && current.photoPath) {
    await removeMediaFile(current.photoPath);
  }
}

export function coachErrorHint(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : "";
  if (
    message.includes("srb_coach_profile") ||
    message.includes("srb-media") ||
    message.toLowerCase().includes("bucket")
  ) {
    return "Apply supabase/migrations/007_srb_coach_and_gallery.sql, then reload.";
  }
  return fallback;
}
