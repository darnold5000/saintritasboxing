import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = createMetadata({
  title: "Privacy",
  description: "Privacy information for St. Rita's Boxing.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-4xl text-white">Privacy</h1>
      <p className="mt-4 text-white/75">
        {SITE.name} collects the name, email, phone, and training details you submit to
        book sessions or send a message. Payment details are handled by Stripe. We do
        not sell this information.
      </p>
      <p className="mt-4 text-white/75">
        Contact {SITE.phone} with privacy questions.
      </p>
    </section>
  );
}
