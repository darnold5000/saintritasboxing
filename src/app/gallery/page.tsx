import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { listGalleryImages } from "@/lib/data/gallery";
import { createMetadata } from "@/lib/seo";
import { isServiceRoleConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "Gallery",
  description: "Photos from St. Rita's Boxing at SonShine Park in Mooresville, Indiana.",
  path: "/gallery",
});

export default async function GalleryPage() {
  let images: Awaited<ReturnType<typeof listGalleryImages>> = [];
  if (isServiceRoleConfigured()) {
    try {
      images = await listGalleryImages();
    } catch {
      images = [];
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Gallery</p>
      <h1 className="mt-3 font-heading text-4xl text-white sm:text-6xl">Inside the gym.</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75">
        Training, the gym, and the people at St. Rita&apos;s Boxing.
      </p>
      <div className="mt-10">
        <GalleryGrid images={images} />
      </div>
    </section>
  );
}
