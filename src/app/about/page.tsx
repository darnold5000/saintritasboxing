import { CoachSection } from "@/components/about/coach-section";
import { Button } from "@/components/ui/button";
import { EMPTY_COACH, getCoachProfile } from "@/lib/data/coach";
import { createMetadata } from "@/lib/seo";
import { isServiceRoleConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "About St. Rita's Boxing",
  description:
    "St. Rita's Boxing at SonShine Park in Mooresville, Indiana. Personalized boxing instruction for skill, strength, discipline, and confidence.",
  path: "/about",
});

export default async function AboutPage() {
  let coach = EMPTY_COACH;
  if (isServiceRoleConfigured()) {
    try {
      coach = await getCoachProfile();
    } catch {
      coach = EMPTY_COACH;
    }
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">About</p>
        <h1 className="mt-3 font-heading text-4xl text-white sm:text-6xl">St. Rita&apos;s Boxing.</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/75">
          St. Rita&apos;s Boxing trains at SonShine Park in Mooresville, Indiana. The work is
          boxing skill and real fitness — personalized instruction that builds strength,
          discipline, and confidence.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/book" size="lg">
            Book training
          </Button>
          <Button href="/gallery" variant="outline" size="lg">
            View gallery
          </Button>
        </div>
      </section>
      <CoachSection coach={coach} />
    </>
  );
}
