import { OfferingsAdmin } from "@/components/admin/offerings-admin";
import { loadOfferings } from "@/lib/data/offerings";

export const dynamic = "force-dynamic";

export default async function AdminPackagesPage() {
  const offerings = await loadOfferings(true);
  return (
    <div>
      <h1 className="font-heading text-4xl text-foreground">Packages</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Change a price or add a package. The website and new checkouts use what you save.
        People who already started a monthly plan stay on the price they signed up with.
        A price of 0 stays off checkout until you set the rate.
      </p>
      <div className="mt-6">
        <OfferingsAdmin offerings={offerings} />
      </div>
    </div>
  );
}
