export type ImageKind = "jpg" | "png" | "webp";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function imageKind(bytes: Uint8Array): ImageKind | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "png";
  }
  const riff =
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
  const webp =
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  if (riff && webp) return "webp";
  return null;
}

export function imageContentType(kind: ImageKind) {
  if (kind === "jpg") return "image/jpeg";
  if (kind === "png") return "image/png";
  return "image/webp";
}

export async function readUploadedImage(file: FormDataEntryValue | null) {
  if (file == null || typeof file === "string") return null;
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file." as const };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Use a JPG, PNG, or WebP under 5 MB." as const };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = imageKind(bytes);
  if (!kind) return { error: "Use a JPG, PNG, or WebP under 5 MB." as const };
  return { bytes, kind, contentType: imageContentType(kind) };
}
