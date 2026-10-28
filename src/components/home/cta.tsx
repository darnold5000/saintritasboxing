import { Button } from "@/components/ui/button";

export function HomeCta() {
  return (
    <section className="bg-brand">
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
          Ready to train?
        </p>
        <h2 className="mt-3 font-heading text-4xl text-white sm:text-6xl">
          Step into the ring.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/80">
          Book a private or partner session and start with real boxing work — not a
          generic fitness class.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href="/book" size="lg">
            Book your first session
          </Button>
        </div>
      </div>
    </section>
  );
}
