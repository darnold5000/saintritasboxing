import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { allowIndexing } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!allowIndexing()) return [];
  const pages = ["/", "/training", "/pricing", "/book", "/about", "/contact"];
  return pages.map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
