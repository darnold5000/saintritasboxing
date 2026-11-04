import Image from "next/image";
import type { CoachProfile } from "@/lib/data/coach";

const HIGHLIGHTS = [
  { figure: "2×", label: "Indiana Golden Gloves champion" },
  { figure: "23", label: "Professional victories" },
  { figure: "WBO", label: "World title challenger" },
];

function bioParagraphs(bio: string) {
  return bio
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function CoachSection({ coach }: { coach: CoachProfile }) {
  const paragraphs = bioParagraphs(coach.bio);
  const intro = paragraphs[0] ?? "";
  const rest = paragraphs.slice(1);
  const heading = coach.name.trim() || "George Blades";
  const hasPhoto = Boolean(coach.photoUrl);

  return (
    <section className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div
          className={
            hasPhoto
              ? "grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] lg:gap-14"
              : undefined
          }
        >
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Owner & head coach</p>
            <h2 className="mt-3 font-heading text-5xl leading-none text-white sm:text-6xl">{heading}</h2>
            <p className="mt-4 font-heading text-xl tracking-wide text-gold sm:text-2xl">
              Former professional boxer
            </p>
            {coach.roleTitle ? (
              <p className="mt-3 text-sm font-semibold text-white/70">{coach.roleTitle}</p>
            ) : null}

            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {HIGHLIGHTS.map((item) => (
                <li key={item.figure} className="min-w-0 border border-gold/40 bg-white/[0.03] px-4 py-4">
                  <p className="font-heading text-3xl leading-none text-gold">{item.figure}</p>
                  <p className="mt-2 text-[11px] font-bold uppercase leading-snug tracking-[0.14em] text-white">
                    {item.label}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
              16 professional knockouts
            </p>

            {intro ? (
              <p className="mt-10 max-w-3xl text-lg leading-8 text-white/85">{intro}</p>
            ) : null}
          </div>
          {hasPhoto ? <PhotoFrame coach={coach} /> : null}
        </div>

        {rest.length > 0 ? (
          <div className="mt-12 max-w-3xl space-y-6 border-t border-white/10 pt-10">
            <h3 className="font-heading text-2xl text-white sm:text-3xl">
              From Golden Gloves to the world stage.
            </h3>
            {rest.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="text-base leading-8 text-white/75">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}

        <aside className="mt-12 max-w-3xl border border-gold/25 bg-white/[0.02] px-5 py-5 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">From the archives</p>
          <h3 className="mt-3 font-heading text-2xl text-white">Blades sharpens up</h3>
          <p className="mt-3 text-sm leading-7 text-white/70">
            An Orlando Sentinel feature documented George&apos;s early boxing career, his demanding
            training routine, and his rise through the amateur ranks.
          </p>
        </aside>
      </div>
    </section>
  );
}

function PhotoFrame({ coach }: { coach: CoachProfile }) {
  if (!coach.photoUrl) return null;
  return (
    <div className="mx-auto w-full max-w-md border border-gold/70 bg-ink p-2 lg:mx-0 lg:max-w-none">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <Image
          src={coach.photoUrl}
          alt={coach.name ? `${coach.name}, coach at St. Rita's Boxing` : "Coach at St. Rita's Boxing"}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
