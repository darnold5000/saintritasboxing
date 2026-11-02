import { mediaPublicUrl, removeMediaFile, uploadMediaFile } from "@/lib/data/media-files";
import type { ImageKind } from "@/lib/images";
import { TABLES } from "@/lib/tables";
import { createServiceClient } from "@/lib/supabase/server";

export type GalleryImage = {
  id: string;
  caption: string | null;
  imageUrl: string;
  createdAt: string;
};

function mapImage(row: {
  id: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
}): GalleryImage | null {
  const imageUrl = mediaPublicUrl(row.storage_path);
  if (!imageUrl) return null;
  return {
    id: String(row.id),
    caption: row.caption?.trim() ? row.caption.trim() : null,
    imageUrl,
    createdAt: String(row.created_at),
  };
}

export async function listGalleryImages(): Promise<GalleryImage[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from(TABLES.galleryImages)
    .select("id, storage_path, caption, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((row) =>
      mapImage({
        id: String(row.id),
        storage_path: String(row.storage_path),
        caption: row.caption ? String(row.caption) : null,
        created_at: String(row.created_at),
      }),
    )
    .filter((image): image is GalleryImage => image !== null);
}

export async function createGalleryImage(input: {
  bytes: Uint8Array;
  kind: ImageKind;
  contentType: string;
  caption: string | null;
}) {
  const path = `gallery/${crypto.randomUUID()}.${input.kind}`;
  const imageUrl = await uploadMediaFile(path, input.bytes, input.contentType);
  const db = createServiceClient();
  const { error } = await db.from(TABLES.galleryImages).insert({
    storage_path: path,
    image_url: imageUrl,
    caption: input.caption,
  });
  if (error) {
    await removeMediaFile(path);
    throw new Error(error.message);
  }
}

export async function updateGalleryCaption(id: string, caption: string | null) {
  const db = createServiceClient();
  const { error } = await db
    .from(TABLES.galleryImages)
    .update({ caption, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteGalleryImage(id: string) {
  const db = createServiceClient();
  const { data, error } = await db
    .from(TABLES.galleryImages)
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return;
  const { error: deleteError } = await db.from(TABLES.galleryImages).delete().eq("id", id);
  if (deleteError) throw new Error(deleteError.message);
  await removeMediaFile(String(data.storage_path));
}

export function galleryErrorHint(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : "";
  if (
    message.includes("srb_gallery_images") ||
    message.includes("srb-media") ||
    message.toLowerCase().includes("bucket")
  ) {
    return "Apply supabase/migrations/007_srb_coach_and_gallery.sql, then reload.";
  }
  return fallback;
}
