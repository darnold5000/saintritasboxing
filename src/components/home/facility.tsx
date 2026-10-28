import Image from "next/image";
import { SITE } from "@/lib/site";

const POINTS = [
  "Training at SonShine Park in Mooresville",
  "Boxing and fitness equipment",
  "Personalized instruction",
  "A welcoming training environment",
];

export function HomeFacility() {
  return (
    <section className="bg-surface/60">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
            Our facility
          </p>
          <h2 className="mt-3 font-heading text-4xl text-white sm:text-5xl">
            SonShine Park.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/75">
            St. Rita&apos;s Boxing trains at SonShine Park. Bring your work ethic — the
            coaching, equipment, and space are here for boxing, fitness, and
            confidence.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-white/80">
            {POINTS.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-white/50">
            Facility photos can be added in <code>public/images/facility/</code> when
            they are available. We are using the official hornet branding until then.
          </p>
        </div>
        <div>
          <Image
            src={SITE.logo.src}
            alt={SITE.logo.alt}
            width={1024}
            height={1024}
            className="h-auto w-full rounded-2xl border border-white/10 object-cover"
          />
        </div>
      </div>
    </section>
  );
}
