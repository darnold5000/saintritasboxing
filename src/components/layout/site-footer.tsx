"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FooterCredit } from "@/components/layout/footer-credit";
import { NAV_LINKS, SITE } from "@/lib/site";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname === "/login") return null;
  return (
    <footer className="mt-auto border-t border-white/10 bg-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <Image
              src={SITE.logo.src}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-md object-cover ring-1 ring-gold/40"
            />
            <span className="font-heading text-xl text-gold">{SITE.shortName}</span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-white/70">
            Boxing training at SonShine Park in Mooresville, Indiana. Skills, strength,
            discipline, and confidence — for every fitness level.
          </p>
        </div>
        <div>
          <h2 className="mb-3 font-heading text-sm tracking-widest text-gold">Navigate</h2>
          <ul className="space-y-2 text-sm text-white/80">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/book" className="hover:text-white">
                Book now
              </Link>
            </li>
            <li>
              <Link href="/my" className="hover:text-white">
                My training
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-heading text-sm tracking-widest text-gold">Get started</h2>
          <ul className="space-y-2 text-sm text-white/80">
            <li>{SITE.address.full}</li>
            <li>
              <a href={SITE.phoneHref} className="hover:text-white">
                Call {SITE.phone}
              </a>
            </li>
            <li>
              <a href={SITE.smsHref} className="hover:text-white">
                Text {SITE.phone}
              </a>
            </li>
            <li>
              <Link href="/book" className="font-semibold text-gold hover:text-white">
                Book training
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white">
                Staff Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <FooterCredit />
        </div>
      </div>
    </footer>
  );
}
