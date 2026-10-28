import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { allowIndexing } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/login", "/my/", "/book/success", "/book/cancelled"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
