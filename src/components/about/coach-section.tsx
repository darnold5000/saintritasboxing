import Image from "next/image";
import type { CoachProfile } from "@/lib/data/coach";

function bioParagraphs(bio: string) {
  return bio
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function CoachSection({ coach }: { coach: CoachProfile }) {
  const paragraphs = bioParagraphs(coach.bio);
  const heading = coach.name.trim() || "Owner & coach";

  return (
    <section className="border-t border-white/10">
      <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:py-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Owner & coach</p>
          <h2 className="mt-3 font-heading text-4xl text-white sm:text-5xl">{heading}</h2>
          {coach.roleTitle ? (
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-gold">
              {coach.roleTitle}
            </p>
          ) : null}
          {paragraphs.length > 0 ? (
            <div className="mt-5 space-y-4">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line text-base leading-relaxed text-white/75">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-base leading-relaxed text-white/75">
              The owner and coach bio will be posted here.
            </p>
          )}
        </div>
        {coach.photoUrl ? (
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-surface">
            <Image
              src={coach.photoUrl}
              alt={coach.name ? `${coach.name}, coach at St. Rita's Boxing` : "Coach at St. Rita's Boxing"}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-dashed border-gold/50 bg-surface px-6 text-center">
            <div>
              <p className="font-heading text-3xl text-gold">Photo</p>
              <p className="mt-2 text-sm text-white/60">Coach photo goes here</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
