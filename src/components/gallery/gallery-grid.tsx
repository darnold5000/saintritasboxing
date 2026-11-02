import Image from "next/image";
import type { GalleryImage } from "@/lib/data/gallery";

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gold/40 bg-surface px-6 py-16 text-center">
        <p className="font-heading text-3xl text-gold">Gallery</p>
        <p className="mt-3 text-sm text-white/65">Photos will show up here once they are added.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image) => (
        <li
          key={image.id}
          className="overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-[0_20px_50px_rgb(0_0_0/0.25)]"
        >
          <div className="relative aspect-[4/3]">
            <Image
              src={image.imageUrl}
              alt={image.caption ?? "Photo from St. Rita's Boxing"}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          {image.caption ? (
            <p className="border-t border-gold/30 px-4 py-3 text-sm leading-relaxed text-white/80">
              {image.caption}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
