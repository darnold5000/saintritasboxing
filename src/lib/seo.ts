import type { Metadata } from "next";
import { SITE } from "@/lib/site";

/**
 * St. Rita's Boxing is opted in for indexing (owner requested local SEO).
 * Hardcoded — do not gate this on env.
 */
export const SITE_INDEXABLE = true;

export function allowIndexing(): boolean {
  return SITE_INDEXABLE;
}

function robotsFor(index: boolean): NonNullable<Metadata["robots"]> {
  return {
    index,
    follow: index,
    googleBot: { index, follow: index },
  };
}

type SeoInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  exactTitle?: boolean;
  index?: boolean;
};

export function createMetadata({
  title,
  description,
  path = "",
  image = SITE.ogImage,
  exactTitle = false,
  index,
}: SeoInput): Metadata {
  const url = `${SITE.url}${path}`;
  const imageUrl = new URL(image, SITE.url).toString();
  const fullTitle = exactTitle ? title : `${title} | ${SITE.name}`;
  const shouldIndex = index ?? allowIndexing();

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE.name,
      locale: "en_US",
      type: "website",
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    alternates: { canonical: url },
    robots: robotsFor(shouldIndex),
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}${SITE.logo.src}`,
    telephone: SITE.phone,
    ...(SITE.email ? { email: SITE.email } : {}),
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    telephone: SITE.phone,
    ...(SITE.email ? { email: SITE.email } : {}),
    image: `${SITE.url}${SITE.logo.src}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.line1,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.postalCode,
      addressCountry: "US",
    },
    areaServed: ["Mooresville", "Morgan County", "Indianapolis"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Boxing training",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "1-on-1 private boxing training",
            areaServed: "Mooresville, Indiana",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "2-on-1 partner boxing training",
            areaServed: "Mooresville, Indiana",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Unlimited monthly adult and youth weekday classes",
            areaServed: "Mooresville, Indiana",
          },
        },
      ],
    },
  };
}
