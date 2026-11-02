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

export const DEFAULT_COACH: CoachProfile = {
  name: "George Blades",
  roleTitle: "Founder, St. Rita's Boxing | Former Professional Boxer",
  bio: [
    "George Blades brings a lifetime of boxing experience and a passion for the sport to St. Rita's Boxing in Mooresville, Indiana.",
    'Known in the professional boxing world as "Honey Boy," George compiled an impressive record of 23 victories, including 16 knockouts, during a professional career spanning 1999 to 2014.',
    "His accomplishments include capturing the NABC Cruiserweight Championship in 2004 and the WBC Latino Light Heavyweight Championship in 2007. That same year, he competed on the world stage, challenging Zsolt Erdei for the WBO Light Heavyweight World Championship in Budapest, Hungary.",
    "Today, St. Rita's Boxing is built around the values of hard work, discipline, confidence, and personal growth. Located inside SonShine Park, the gym offers a place for individuals to develop boxing skills, improve fitness, and challenge themselves.",
    "Whether you're stepping into a boxing gym for the first time or looking to take your training further, St. Rita's Boxing is about putting in the work and becoming better every day.",
  ].join("\n\n"),
  photoPath: null,
  photoUrl: null,
};

export function withCoachDefaults(coach: CoachProfile): CoachProfile {
  const hasCopy = coach.name.trim() || coach.roleTitle.trim() || coach.bio.trim();
  if (hasCopy) return coach;
  return { ...DEFAULT_COACH, photoPath: coach.photoPath, photoUrl: coach.photoUrl };
}

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
