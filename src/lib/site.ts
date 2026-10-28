export const SITE = {
  name: "St. Rita's Boxing",
  shortName: "St. Rita's",
  legalName: "St. Rita's Boxing",
  tagline: "Train hard. Be better.",
  description:
    "Private boxing training at SonShine Park in Mooresville, Indiana. One-on-one and partner sessions for boxing skills, strength, and confidence.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  ),
  phone: "(407) 844-2522",
  phoneHref: "tel:+14078442522",
  smsHref: "sms:+14078442522",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "",
  timezone: "America/Indiana/Indianapolis",
  address: {
    venue: "SonShine Park",
    line1: "310 Indianapolis Road",
    city: "Mooresville",
    state: "IN",
    postalCode: "46158",
    full: "SonShine Park, 310 Indianapolis Road, Mooresville, IN 46158",
  },
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=310+Indianapolis+Road,+Mooresville,+IN+46158",
  mapEmbedUrl:
    "https://www.google.com/maps?q=310+Indianapolis+Road,+Mooresville,+IN+46158&output=embed",
  logo: {
    src: "/images/brand/hornet-logo.jpg",
    alt: "St. Rita's Boxing hornet mascot with purple boxing gloves",
    width: 1024,
    height: 1024,
  },
  ogImage: "/images/brand/hornet-logo.jpg",
  signalWorks: {
    name: "Signal Works Platform",
    url: "https://hiresignalworks.com",
    title: "Professional websites, software & AI solutions.",
    icon: "/signal-works-icon.png",
  },
  defaultSessionDurationMinutes: 60,
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/training", label: "Training" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const BRAND = {
  ink: "#0B0A0F",
  surface: "#17121F",
  purple: "#6516A4",
  gold: "#F3B72F",
  white: "#FFFFFF",
  offWhite: "#F7F4ED",
  muted: "#B9B5C0",
} as const;
