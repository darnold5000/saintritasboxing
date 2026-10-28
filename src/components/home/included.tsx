const ITEMS = [
  "Boxing fundamentals",
  "Mitt work",
  "Heavy-bag training",
  "Footwork and conditioning",
  "Strength and fitness",
  "Self-defense fundamentals",
  "Personalized workout plans",
  "Goal-based training",
];

export function HomeIncluded() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
        What&apos;s included
      </p>
      <h2 className="mt-3 font-heading text-4xl text-white sm:text-5xl">
        The work that matters.
      </h2>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ITEMS.map((item) => (
          <article
            key={item}
            className="rounded-xl border border-white/10 bg-surface px-4 py-5 text-sm font-semibold text-white"
          >
            {item}
          </article>
        ))}
      </div>
    </section>
  );
}
