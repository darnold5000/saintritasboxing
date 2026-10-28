import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = createMetadata({
  title: "Booking received",
  description: "St. Rita's Boxing checkout return page.",
  path: "/book/success",
  index: false,
});

export default async function BookSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string; booked?: string }>;
}) {
  const { demo, booked } = await searchParams;
  const creditBooked = booked === "credit";
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
        {demo ? "Demo checkout" : creditBooked ? "Session confirmed" : "Payment submitted"}
      </p>
      <h1 className="mt-3 font-heading text-4xl text-white">
        {demo
          ? "No payment was taken."
          : creditBooked
            ? "You're on the schedule."
            : "Thanks. We're confirming it now."}
      </h1>
      <p className="mt-4 text-white/75">
        {demo
          ? "Stripe is not configured yet, so this was a sample booking flow. Live reservations require St. Rita's Stripe account, webhook, and database."
          : creditBooked
            ? "One session credit was applied. You'll receive confirmation details when email is configured."
            : "Paid bookings are confirmed by the Stripe webhook, not this page. You will receive email when payment is verified."}
      </p>
      <p className="mt-4 text-sm text-white/60">{SITE.address.full}</p>
      <Link href="/" className="mt-8 inline-block text-gold underline">
        Back to home
      </Link>
    </section>
  );
}
