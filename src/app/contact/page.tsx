import { ContactForm } from "@/components/contact/contact-form";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = createMetadata({
  title: "Contact St. Rita's Boxing",
  description:
    "Contact St. Rita's Boxing at SonShine Park, 310 Indianapolis Road, Mooresville, IN 46158. Call or text (407) 844-2522.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Contact</p>
        <h1 className="mt-3 font-heading text-4xl text-white sm:text-5xl">{SITE.name}</h1>
        <p className="mt-4 text-white/80">{SITE.address.venue}</p>
        <p className="text-white/80">{SITE.address.line1}</p>
        <p className="text-white/80">
          {SITE.address.city}, {SITE.address.state} {SITE.address.postalCode}
        </p>
        <p className="mt-4 text-sm text-white/50">
          Confirm address and phone with the owner before launch.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button href={SITE.phoneHref}>Call {SITE.phone}</Button>
          <Button href={SITE.smsHref} variant="outline">
            Text {SITE.phone}
          </Button>
          <Button href={SITE.directionsUrl} variant="outline">
            Directions
          </Button>
        </div>
        <div className="mt-8">
          <Button href="/book" size="lg">
            Book training
          </Button>
        </div>
        <iframe
          title="Map to SonShine Park"
          src={SITE.mapEmbedUrl}
          className="mt-8 h-64 w-full rounded-2xl border border-white/10"
          loading="lazy"
        />
      </div>
      <ContactForm />
    </section>
  );
}
