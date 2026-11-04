import Image from "next/image";
import type { CoachProfile } from "@/lib/data/coach";

const CAREERS = [
  {
    title: "Amateur career",
    note: "These amateur figures were reported in a historical newspaper article and may not represent final career totals.",
    stats: [
      { figure: "40–5", label: "Reported amateur record" },
      { figure: "35", label: "Amateur knockouts" },
      { figure: "2×", label: "Indiana Golden Gloves champion" },
    ],
  },
  {
    title: "Professional career",
    note: null,
    stats: [
      { figure: "23", label: "Professional victories" },
      { figure: "16", label: "Professional knockouts" },
      { figure: "WBO", label: "World title challenger" },
    ],
  },
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

  return (
    <section className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Owner & head coach</p>
          <h2 className="mt-3 font-heading text-5xl leading-none text-white sm:text-6xl">{heading}</h2>
          <p className="mt-4 font-heading text-xl tracking-wide text-gold sm:text-2xl">
            Former professional boxer
          </p>
          {coach.roleTitle ? (
            <p className="mt-3 text-sm font-semibold text-white/70">{coach.roleTitle}</p>
          ) : null}

          <div className="mt-8 space-y-6">
            {CAREERS.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{group.title}</h3>
                <ul className="mt-3 grid gap-3 sm:grid-cols-3">
                  {group.stats.map((item) => (
                    <li
                      key={item.label}
                      className="min-w-0 border border-gold/40 bg-white/[0.03] px-4 py-3 shadow-[inset_3px_0_0_#6516A4]"
                    >
                      <p className="font-heading text-3xl leading-none text-gold">{item.figure}</p>
                      <p className="mt-2 text-[11px] font-bold uppercase leading-snug tracking-[0.12em] text-white">
                        {item.label}
                      </p>
                    </li>
                  ))}
                </ul>
                {group.note ? (
                  <p className="mt-2 max-w-3xl text-xs leading-5 text-white/50">{group.note}</p>
                ) : null}
              </div>
            ))}
            <ul className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/70 sm:flex-row sm:gap-4">
              <li>2004 NABC Cruiserweight Champion</li>
              <li>2007 WBC Latino Light Heavyweight Champion</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 grid items-start gap-10 border-t border-white/10 pt-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] lg:gap-14">
          <div className="min-w-0">
            {intro ? <p className="text-lg leading-8 text-white/85">{intro}</p> : null}
            {rest.length > 0 ? (
              <div className={`${intro ? "mt-8 space-y-6" : "space-y-6"}`}>
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
          </div>
          <PhotoFrame coach={coach} />
        </div>
      </div>
    </section>
  );
}

function PhotoFrame({ coach }: { coach: CoachProfile }) {
  return (
    <div className="mx-auto w-full max-w-md border border-gold/70 bg-ink p-2 lg:mx-0 lg:max-w-none">
      {coach.photoUrl ? (
        <div className="relative aspect-[4/5] overflow-hidden bg-surface">
          <Image
            src={coach.photoUrl}
            alt={coach.name ? `${coach.name}, coach at St. Rita's Boxing` : "Coach at St. Rita's Boxing"}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-[4/5] flex-col items-center justify-center border border-gold/30 bg-surface px-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold">St. Rita&apos;s Boxing</p>
          <p className="mt-8 font-heading text-4xl leading-none text-white sm:text-5xl">Photo</p>
          <p className="mt-2 font-heading text-4xl leading-none text-gold sm:text-5xl">coming soon</p>
        </div>
      )}
    </div>
  );
}
