import { Button } from "@/components/ui/button";
import {
  TRAINING_TYPES,
  formatUsd,
  offeringById,
  offeringsForType,
  packageSavings,
  REGISTRATION_FEE,
  type CatalogOffering,
  type TrainingTypeId,
} from "@/lib/catalog";

const SESSION_TYPES: TrainingTypeId[] = ["private", "partner"];

const CLASS_PLANS: {
  id: string;
  audience: string;
  detail: string;
}[] = [
  {
    id: "class-youth-unlimited",
    audience: "Youth",
    detail: "Under 18. Weekday youth classes only. Billed every month until cancelled.",
  },
  {
    id: "class-adult-unlimited",
    audience: "Adult",
    detail: "18 and over. Weekday adult classes only. Billed every month until cancelled.",
  },
];

export function PackageCards() {
  return (
    <div className="space-y-14">
      {SESSION_TYPES.map((typeId) => {
        const type = TRAINING_TYPES[typeId];
        return (
          <section key={typeId}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              {type.eyebrow}
            </p>
            <h2 className="mt-2 font-heading text-3xl text-white sm:text-4xl">{type.name}</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/70">{type.summary}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {offeringsForType(typeId).map((offering) => (
                <OfferingCard key={offering.id} offering={offering} typeId={typeId} />
              ))}
            </div>
          </section>
        );
      })}

      <section>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
          Weekday classes
        </p>
        <h2 className="mt-2 font-heading text-3xl text-white sm:text-4xl">Unlimited monthly</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/70">
          One plan for youth and one for adults. A youth membership only books youth class. An
          adult membership only books adult class.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {CLASS_PLANS.map((plan) => {
            const offering = offeringById(plan.id);
            if (!offering) return null;
            return (
              <OfferingCard
                key={plan.id}
                offering={offering}
                typeId={offering.trainingType}
                audience={plan.audience}
                detail={plan.detail}
              />
            );
          })}
        </div>
      </section>

      <aside className="rounded-2xl border border-gold/30 bg-gold/10 p-6">
        <h2 className="font-heading text-2xl text-gold">Registration fee</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          {REGISTRATION_FEE.publicExplanation}
        </p>
      </aside>
    </div>
  );
}

function OfferingCard({
  offering,
  typeId,
  audience,
  detail,
}: {
  offering: CatalogOffering;
  typeId: TrainingTypeId;
  audience?: string;
  detail?: string;
}) {
  const savings = packageSavings(offering);
  return (
    <article className="flex flex-col rounded-2xl border border-white/10 bg-surface p-6">
      {audience ? (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{audience}</p>
      ) : null}
      <h3 className={`font-heading text-2xl text-white ${audience ? "mt-1" : ""}`}>
        {audience ? "Unlimited monthly" : offering.name}
      </h3>
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
      {offering.kind === "subscription" && !audience ? (
        <p className="mt-2 text-xs text-white/60">
          Recurring. Manage or cancel in Stripe Customer Portal.
        </p>
      ) : null}
      <p className="mt-3 flex-1 text-sm text-white/65">{detail ?? offering.description}</p>
      <div className="mt-6">
        <Button href={`/book?type=${typeId}&offering=${offering.id}`} className="w-full">
          {offering.cta}
        </Button>
      </div>
    </article>
  );
}
