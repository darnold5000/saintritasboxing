import { GalleryAdmin } from "@/components/admin/gallery-admin";
import { galleryErrorHint, listGalleryImages } from "@/lib/data/gallery";
import { isServiceRoleConfigured } from "@/lib/supabase/server";

export default async function AdminGalleryPage() {
  const live = isServiceRoleConfigured();
  let images: Awaited<ReturnType<typeof listGalleryImages>> = [];
  let loadError = "";
  if (live) {
    try {
      images = await listGalleryImages();
    } catch (error) {
      loadError = galleryErrorHint(error, "Could not load the gallery.");
    }
  }

  return (
    <section>
      <h1 className="font-heading text-3xl">Gallery</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Add or delete photos for the public Gallery page. A caption is optional.
      </p>
      {!live ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Connect Supabase and apply migration 007 before managing the gallery.
        </p>
      ) : loadError ? (
        <p className="mt-4 text-sm text-red-700">{loadError}</p>
      ) : (
        <GalleryAdmin images={images} />
      )}
    </section>
  );
}
