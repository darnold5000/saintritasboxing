import { HomeHero } from "@/components/home/hero";
import { HomePurpose } from "@/components/home/purpose";
import { HomeTrainingOptions } from "@/components/home/training-options";
import { HomeIncluded } from "@/components/home/included";
import { HomeFacility } from "@/components/home/facility";
import { HomeReviews } from "@/components/home/reviews";
import { HomeCta } from "@/components/home/cta";
import { loadOfferings } from "@/lib/data/offerings";
import { listPublishedReviews } from "@/lib/data/reviews";
import { createMetadata } from "@/lib/seo";
import { isServiceRoleConfigured } from "@/lib/supabase/server";

export const metadata = createMetadata({
  title: "St. Rita's Boxing | Boxing Training in Mooresville, Indiana",
  description:
    "St. Rita's Boxing at SonShine Park in Mooresville, Indiana. Private boxing training, partner sessions, strength, and confidence.",
  path: "/",
  exactTitle: true,
});

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const offerings = await loadOfferings();
  let reviews: Awaited<ReturnType<typeof listPublishedReviews>> = [];
  if (isServiceRoleConfigured()) {
    try {
      reviews = await listPublishedReviews();
    } catch {
      reviews = [];
    }
  }

  return (
    <>
      <HomeHero />
      <HomePurpose />
      <HomeTrainingOptions offerings={offerings} />
      <HomeIncluded />
      <HomeFacility />
      <HomeReviews reviews={reviews} />
      <HomeCta />
    </>
  );
}
