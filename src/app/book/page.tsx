import { Suspense } from "react";
import { BookingExperience } from "@/components/booking/booking-experience";
import { createMetadata } from "@/lib/seo";
import { getOpenDates } from "@/lib/data/availability";

export const metadata = createMetadata({
  title: "Book Boxing Training",
  description:
    "Book private boxing lessons or partner training at St. Rita's Boxing, SonShine Park, Mooresville, Indiana.",
  path: "/book",
});

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const { dates, demo } = await getOpenDates();
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Book now</p>
      <h1 className="mt-3 font-heading text-4xl text-white sm:text-5xl">Book training</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/70">
        Choose training, a package, then a date and time. Payment stays on this site
        through Stripe Checkout. No third-party booking software.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-white/60">Loading booking…</p>}>
          <BookingExperience initialDates={Array.from(dates)} demo={demo} />
        </Suspense>
      </div>
    </section>
  );
}
