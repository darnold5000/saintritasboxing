import { createMetadata } from "@/lib/seo";
import { customerCredits, lookupAccessToken } from "@/lib/data/customers";
import { isServiceRoleConfigured } from "@/lib/supabase/server";
import { formatUsd } from "@/lib/catalog";
import Link from "next/link";

export const metadata = createMetadata({
  title: "Training account",
  description: "View remaining St. Rita's Boxing sessions.",
  path: "/my/verify",
  index: false,
});

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return <Message text="Missing access token." />;
  }
  if (!isServiceRoleConfigured()) {
    return <Message text="Package lookup needs Supabase before it can show live credits." />;
  }
  const found = await lookupAccessToken(token);
  if (!found) {
    return <Message text="This link is invalid or expired." />;
  }
  const credits = await customerCredits(found.email);
  if (!credits) {
    return <Message text="No training account found." />;
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-heading text-4xl text-white">Your sessions</h1>
      <p className="mt-2 text-white/70">{credits.customer.full_name}</p>
      {credits.unlimitedActive ? (
        <p className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-4 text-gold">
          Monthly Unlimited PT is active.
        </p>
      ) : null}
      <ul className="mt-6 space-y-3">
        {credits.purchases.map((purchase) => (
          <li key={purchase.id} className="rounded-xl border border-white/10 bg-surface p-4">
            <p className="font-heading text-xl text-white">{purchase.name}</p>
            <p className="text-sm text-white/70">
              {purchase.sessions_total} purchased · {purchase.sessions_remaining} remaining
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-white/50">
        Package prices on file are stored at purchase time. Current singles start at{" "}
        {formatUsd(5000)}.
      </p>
      <Link href={`/book?token=${encodeURIComponent(token)}`} className="mt-6 inline-block text-gold underline">
        Book a session with credits
      </Link>
    </section>
  );
}

function Message({ text }: { text: string }) {
  return (
    <section className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-heading text-3xl text-white">{text}</h1>
      <Link href="/my" className="mt-6 inline-block text-gold underline">
        Request a new link
      </Link>
    </section>
  );
}
