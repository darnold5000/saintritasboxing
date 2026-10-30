import { Button } from "@/components/ui/button";
import {
  TRAINING_TYPES,
  formatUsd,
  offeringsForType,
  packageSavings,
  REGISTRATION_FEE,
  type TrainingTypeId,
} from "@/lib/catalog";

export function PackageCards() {
  return (
    <div className="space-y-14">
      {(Object.keys(TRAINING_TYPES) as TrainingTypeId[]).map((typeId) => {
        const type = TRAINING_TYPES[typeId];
        return (
          <section key={typeId}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              {type.eyebrow}
            </p>
            <h2 className="mt-2 font-heading text-3xl text-white sm:text-4xl">{type.name}</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/70">{type.summary}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {offeringsForType(typeId).map((offering) => {
                const savings = packageSavings(offering);
                return (
                  <article
                    key={offering.id}
                    className="flex flex-col rounded-2xl border border-white/10 bg-surface p-6"
                  >
                    <h3 className="font-heading text-2xl text-white">{offering.name}</h3>
                    <p className="mt-3 font-heading text-4xl text-gold">
                      {offering.priceCents > 0 ? formatUsd(offering.priceCents) : "Rate not set"}
                      {offering.interval === "month" && offering.priceCents > 0 ? (
                        <span className="ml-1 text-base font-sans text-white/60">/month</span>
                      ) : null}
                    </p>
                    {typeId === "partner" ? (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gold">
                        Total for two participants
                      </p>
                    ) : null}
                    {savings ? (
                      <p className="mt-2 text-sm text-white/70">
                        Save {formatUsd(savings.savedCents)} versus singles.
                      </p>
                    ) : null}
                    {offering.kind === "subscription" ? (
                      <p className="mt-2 text-xs text-white/60">
                        Recurring. Manage or cancel in Stripe Customer Portal.
                      </p>
                    ) : null}
                    <p className="mt-3 flex-1 text-sm text-white/65">{offering.description}</p>
                    <div className="mt-6">
                      <Button href={`/book?type=${typeId}&offering=${offering.id}`} className="w-full">
                        {offering.cta}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
      <aside className="rounded-2xl border border-gold/30 bg-gold/10 p-6">
        <h2 className="font-heading text-2xl text-gold">Registration fee</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          {REGISTRATION_FEE.publicExplanation}
        </p>
      </aside>
    </div>
  );
}
