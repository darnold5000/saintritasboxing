import Image from "next/image";
import type { CoachProfile } from "@/lib/data/coach";

function bioParagraphs(bio: string) {
  return bio
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function CoachSection({ coach }: { coach: CoachProfile }) {
  const blocks = bioParagraphs(coach.bio);
  const tagline = blocks[0] && blocks[0] === blocks[0].toUpperCase() ? blocks[0] : null;
  const paragraphs = tagline ? blocks.slice(1) : blocks;
  const heading = coach.name.trim() || "Owner & coach";

  return (
    <section className="border-t border-white/10">
      <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:gap-14 lg:py-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Owner & coach</p>
          <h2 className="mt-3 font-heading text-4xl text-white sm:text-5xl">{heading}</h2>
          {coach.roleTitle ? (
            <p className="mt-3 text-sm font-semibold tracking-wide text-gold">{coach.roleTitle}</p>
          ) : null}
          {tagline ? (
            <p className="mt-6 font-heading text-2xl leading-tight text-white sm:text-3xl">{tagline}</p>
          ) : null}
          {paragraphs.length > 0 ? (
            <div className="mt-5 space-y-4">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line text-base leading-relaxed text-white/75">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}
        </div>
        <PhotoFrame coach={coach} />
      </div>
    </section>
  );
}

function PhotoFrame({ coach }: { coach: CoachProfile }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-gold via-[#c9a15a] to-brand p-[3px] shadow-[0_28px_70px_rgb(0_0_0/0.45)]">
      <div className="rounded-[21px] bg-ink p-3">
        {coach.photoUrl ? (
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
            <Image
              src={coach.photoUrl}
              alt={coach.name ? `${coach.name}, coach at St. Rita's Boxing` : "Coach at St. Rita's Boxing"}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/5] flex-col items-center justify-center rounded-2xl border border-gold/30 bg-[radial-gradient(circle_at_top,rgb(101_22_164/0.45),#0b0a0f_62%)] px-8 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-gold">St. Rita&apos;s Boxing</p>
            <p className="mt-8 font-heading text-4xl leading-none text-white sm:text-5xl">Photo</p>
            <p className="mt-2 font-heading text-4xl leading-none text-gold sm:text-5xl">coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
