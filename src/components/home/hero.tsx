import Image from "next/image";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

const PILLARS = [
  "Boxing Fundamentals",
  "Personal Training",
  "Strength & Conditioning",
  "Confidence",
];

export function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-ink" />
      <div className="athletic-grid absolute inset-0 opacity-50" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 55% 50% at 88% 30%, rgb(101 22 164 / 0.28), transparent 58%), radial-gradient(ellipse 40% 35% at 8% 80%, rgb(243 183 47 / 0.08), transparent 50%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-2 lg:gap-12 lg:py-20">
        <div className="order-2 lg:order-1">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-gold">
            {SITE.name}
          </p>
          <p className="mb-4 inline-flex items-center gap-2 text-sm text-white/75">
            <MapPin className="h-4 w-4 text-gold" aria-hidden />
            SonShine Park · Mooresville, IN
          </p>
          <h1 className="font-heading text-5xl leading-[0.92] text-white sm:text-6xl md:text-7xl">
            Train hard.
            <br />
            <span className="text-gold">Be better.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Real boxing training. Real strength. Real confidence. Personalized coaching
            for every fitness level.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/book" size="lg">
              Book training
            </Button>
            <Button href="/pricing" variant="outline" size="lg">
              View pricing
            </Button>
          </div>
        </div>
        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <div className="relative w-full max-w-[380px] sm:max-w-[440px]">
            <Image
              src={SITE.logo.src}
              alt={SITE.logo.alt}
              width={1024}
              height={1024}
              priority
              className="relative h-auto w-full rounded-2xl border border-white/10 object-cover shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
              sizes="(max-width: 1024px) 80vw, 440px"
            />
          </div>
        </div>
      </div>
      <div className="relative border-t border-white/10 bg-surface/80">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-px sm:grid-cols-4">
          {PILLARS.map((item) => (
            <li
              key={item}
              className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-white/80 sm:text-xs"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
