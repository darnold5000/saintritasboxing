import { Button } from "@/components/ui/button";
import { TRAINING_TYPES, formatUsd, type CatalogOffering, type TrainingType } from "@/lib/catalog";

function startingCents(type: TrainingType, offerings: CatalogOffering[]) {
  const mine = offerings.filter(
    (item) => item.trainingType === type.id && item.published !== false && item.priceCents > 0,
  );
  const preferred =
    mine.find((item) => item.kind === "single") ??
    mine.find((item) => item.kind === "subscription") ??
    mine[0];
  return preferred?.priceCents ?? 0;
}

export function HomeTrainingOptions({ offerings }: { offerings: CatalogOffering[] }) {
  return (
    <section className="bg-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
          Training options
        </p>
        <h2 className="mt-3 font-heading text-4xl text-white sm:text-5xl">
          Private, partner, or weekly class.
        </h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {Object.values(TRAINING_TYPES).map((type) => (
            <article
              key={type.id}
              className="rounded-2xl border border-white/10 bg-ink p-6 sm:p-8"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                {type.eyebrow}
              </p>
              <h3 className="mt-2 font-heading text-3xl text-white">{type.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{type.summary}</p>
              <p className="mt-5 font-heading text-4xl text-gold">
                {startingCents(type, offerings) > 0 ? formatUsd(startingCents(type, offerings)) : "Monthly"}
                <span className="ml-2 text-sm font-sans font-medium uppercase tracking-wide text-white/60">
                  {startingCents(type, offerings) > 0 ? `starting · ${type.priceQualifier}` : type.priceQualifier}
                </span>
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button href="/pricing" variant="outline">
                  View packages
                </Button>
                <Button href={`/book?type=${type.id}`}>Book now</Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
