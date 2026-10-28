import { HomePurpose } from "@/components/home/purpose";
import { HomeTrainingOptions } from "@/components/home/training-options";
import { HomeIncluded } from "@/components/home/included";
import { HomeCta } from "@/components/home/cta";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Boxing Training in Mooresville",
  description:
    "Private boxing lessons and partner training at St. Rita's Boxing in Mooresville, Indiana. Technique, strength, footwork, and self-defense fundamentals.",
  path: "/training",
});

export default function TrainingPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Training</p>
        <h1 className="mt-3 font-heading text-4xl text-white sm:text-6xl">
          Private boxing training near Mooresville.
        </h1>
        <p className="mt-4 max-w-2xl text-white/75">
          This is personal coaching, not a drop-in class calendar. Book 1-on-1 or 2-on-1
          sessions and work boxing, fitness, and confidence at SonShine Park.
        </p>
      </section>
      <HomePurpose />
      <HomeTrainingOptions />
      <HomeIncluded />
      <HomeCta />
    </>
  );
}
