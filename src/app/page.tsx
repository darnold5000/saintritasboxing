import { HomeHero } from "@/components/home/hero";
import { HomePurpose } from "@/components/home/purpose";
import { HomeTrainingOptions } from "@/components/home/training-options";
import { HomeIncluded } from "@/components/home/included";
import { HomeFacility } from "@/components/home/facility";
import { HomeCta } from "@/components/home/cta";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "St. Rita's Boxing | Boxing Training in Mooresville, Indiana",
  description:
    "St. Rita's Boxing at SonShine Park in Mooresville, Indiana. Private boxing training, partner sessions, strength, and confidence.",
  path: "/",
  exactTitle: true,
});

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomePurpose />
      <HomeTrainingOptions />
      <HomeIncluded />
      <HomeFacility />
      <HomeCta />
    </>
  );
}
