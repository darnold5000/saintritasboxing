import { PackageCards } from "@/components/pricing/package-cards";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Boxing Training Prices in Mooresville",
  description:
    "St. Rita's Boxing prices: 1-on-1 sessions from $50 and 2-on-1 partner training from $70 total. Packages and monthly unlimited PT at SonShine Park.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Pricing</p>
      <h1 className="mt-3 font-heading text-4xl text-white sm:text-6xl">
        Training packages.
      </h1>
      <p className="mt-4 max-w-2xl text-white/75">
        Prices come from the current St. Rita&apos;s flyer. Partner packages are billed as
        one total for two people. The owner can change these in one catalog file.
      </p>
      <div className="mt-10">
        <PackageCards />
      </div>
    </section>
  );
}
