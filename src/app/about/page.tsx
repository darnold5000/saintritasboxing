import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = createMetadata({
  title: "About St. Rita's Boxing",
  description:
    "St. Rita's Boxing at SonShine Park in Mooresville, Indiana. Personalized boxing instruction for skill, strength, discipline, and confidence.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <section className="mx-auto grid max-w-7xl items-start gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">About</p>
        <h1 className="mt-3 font-heading text-4xl text-white sm:text-6xl">
          St. Rita&apos;s Boxing.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/75">
          St. Rita&apos;s Boxing trains at SonShine Park in Mooresville, Indiana. The work
          is boxing skill and real fitness — personalized instruction that builds
          strength, discipline, and confidence.
        </p>
        <p className="mt-4 text-base leading-relaxed text-white/75">
          Sessions are 1-on-1 or 2-on-1. We do not invent coach biographies,
          certifications, fight records, testimonials, or awards here. Those can be
          added when the owner provides them.
        </p>
        <div className="mt-8">
          <Button href="/book" size="lg">
            Book training
          </Button>
        </div>
      </div>
      <Image
        src={SITE.logo.src}
        alt={SITE.logo.alt}
        width={1024}
        height={1024}
        className="h-auto w-full rounded-2xl border border-white/10"
      />
    </section>
  );
}
