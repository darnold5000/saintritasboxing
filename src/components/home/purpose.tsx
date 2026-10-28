const FEATURES = [
  {
    title: "Boxing fundamentals and technique",
    copy: "Stance, punches, defense, and ring IQ taught with patient, focused coaching.",
  },
  {
    title: "Strength and conditioning",
    copy: "Training that builds power, endurance, and the engine behind every round.",
  },
  {
    title: "Footwork and agility",
    copy: "Movement that makes you harder to hit and more dangerous when you attack.",
  },
  {
    title: "Self-defense fundamentals",
    copy: "Practical skills and awareness so the work carries outside the gym.",
  },
];

export function HomePurpose() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
        Train with purpose
      </p>
      <h2 className="mt-3 max-w-3xl font-heading text-4xl text-white sm:text-5xl">
        More than just boxing.
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75">
        Sessions combine boxing skill, fitness, discipline, and confidence. Whether you
        are stepping in for the first time or sharpening your craft, the work is
        personal and the standard is high.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="rounded-2xl border border-white/10 bg-surface p-6">
            <h3 className="font-heading text-xl text-white">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{feature.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
