import { getSupabaseUrl, createServiceClient } from "@/lib/supabase/server";

const BUCKET = "srb-media";
const PATH_PATTERN =
  /^(coach|gallery)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

export function mediaPublicUrl(path: string | null | undefined) {
  if (!path || !PATH_PATTERN.test(path)) return null;
  const base = getSupabaseUrl();
  if (!base) return null;
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

export async function uploadMediaFile(path: string, bytes: Uint8Array, contentType: string) {
  if (!mediaPublicUrl(path)) throw new Error("Image path is not allowed.");
  const db = createServiceClient();
  const { error } = await db.storage.from(BUCKET).upload(path, Buffer.from(bytes), {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const url = mediaPublicUrl(path);
  if (!url) throw new Error("Could not build the image URL.");
  return url;
}

export async function removeMediaFile(path: string | null | undefined) {
  if (!path || !PATH_PATTERN.test(path)) return;
  const db = createServiceClient();
  const { error } = await db.storage.from(BUCKET).remove([path]);
  if (error && !error.message.toLowerCase().includes("not found")) {
    throw new Error(error.message);
  }
}
