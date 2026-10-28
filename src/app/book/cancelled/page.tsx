import Link from "next/link";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Checkout cancelled",
  description: "Stripe checkout was cancelled.",
  path: "/book/cancelled",
  index: false,
});

export default function BookCancelledPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-heading text-4xl text-white">Checkout cancelled</h1>
      <p className="mt-4 text-white/75">
        No payment was taken. Your time is not confirmed until checkout is completed.
      </p>
      <Link href="/book" className="mt-8 inline-block text-gold underline">
        Return to booking
      </Link>
    </section>
  );
}
